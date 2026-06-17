import { eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	match,
	matchMessage,
	matchResult,
	user,
	type Match,
	type SlotEntry
} from '$lib/server/db/schema';
import { locById, playerById, colorForId, isoIn } from '$lib/data';
import type { ResolvedMatch, ResolvedPlayer } from '$lib/types';

const DEFAULT_NTRP = 3.5;

/** All matches, raw. */
export function listMatches(): Promise<Match[]> {
	return db.select().from(match);
}

/** One match, raw. */
export async function getMatch(id: string): Promise<Match | null> {
	const rows = await db.select().from(match).where(eq(match.id, id));
	return rows[0] ?? null;
}

/** Upcoming (date ≥ today), sorted by date+time. */
export function upcoming(matches: Match[]): Match[] {
	const today = isoIn(0);
	return matches
		.filter((m) => m.date >= today)
		.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

/**
 * Resolve raw matches into render-ready shape. Batch-fetches the real users referenced
 * by any `{ type:'user' }` slot so components never touch the DB.
 */
export async function resolveMatches(
	matches: Match[],
	currentUserId: string | undefined
): Promise<ResolvedMatch[]> {
	const userIds = new Set<string>();
	for (const m of matches) {
		for (const s of m.slots) if (s && s.type === 'user') userIds.add(s.id);
	}

	const usersMap = new Map<string, { name: string; ntrp: number; image: string | null }>();
	if (userIds.size > 0) {
		const rows = await db
			.select({ id: user.id, name: user.name, ntrp: user.ntrp, image: user.image })
			.from(user)
			.where(inArray(user.id, [...userIds]));
		for (const r of rows)
			usersMap.set(r.id, { name: r.name, ntrp: r.ntrp ?? DEFAULT_NTRP, image: r.image ?? null });
	}

	const resolveSlot = (entry: SlotEntry, index: number): ResolvedPlayer | null => {
		if (!entry) return null;
		const isHost = index === 0;
		if (entry.type === 'player') {
			const p = playerById(entry.id);
			if (!p) return null;
			return { id: p.id, name: p.name, ntrp: p.ntrp, color: p.color, you: false, isHost };
		}
		// real user
		const u = usersMap.get(entry.id);
		const you = entry.id === currentUserId;
		return {
			id: entry.id,
			name: u?.name ?? 'Player',
			ntrp: u?.ntrp ?? DEFAULT_NTRP,
			color: colorForId(entry.id),
			image: u?.image ?? null,
			you,
			isHost
		};
	};

	return matches
		.map((m): ResolvedMatch | null => {
			const location = locById(m.locationId);
			// Defensive: a match referencing a removed location is skipped rather than crashing.
			if (!location) return null;
			const slots = m.slots.map(resolveSlot);
			const host = slots[0];
			const youIn = slots.some((s) => s?.you);
			const isHosting = !!host?.you;
			const openCount = slots.filter((s) => s === null).length;
			return {
				id: m.id,
				type: m.type as 'singles' | 'doubles',
				location,
				date: m.date,
				time: m.time,
				ntrp: [m.ntrpMin, m.ntrpMax] as [number, number],
				notes: m.notes,
				slots,
				hostName: host?.you ? 'you' : (host?.name ?? 'Unknown'),
				youIn,
				isHosting,
				openCount
			};
		})
		.filter((m): m is ResolvedMatch => m !== null);
}

/** Claim an open slot for the current user. Returns a status for toasting. */
export async function claimSlot(
	id: string,
	idx: number,
	userId: string
): Promise<'ok' | 'taken' | 'already-in' | 'not-found'> {
	const m = await getMatch(id);
	if (!m) return 'not-found';
	if (m.slots.some((s) => s && s.type === 'user' && s.id === userId)) return 'already-in';
	if (idx < 0 || idx >= m.slots.length || m.slots[idx] !== null) return 'taken';

	const slots = m.slots.slice();
	slots[idx] = { type: 'user', id: userId };
	await db.update(match).set({ slots }).where(eq(match.id, id));
	return 'ok';
}

/** Leave a slot the current user holds (host slot 0 cannot be left). */
export async function leaveSlot(
	id: string,
	idx: number,
	userId: string
): Promise<'ok' | 'not-yours' | 'is-host' | 'not-found'> {
	const m = await getMatch(id);
	if (!m) return 'not-found';
	if (idx === 0) return 'is-host';
	const s = m.slots[idx];
	if (!s || s.type !== 'user' || s.id !== userId) return 'not-yours';

	const slots = m.slots.slice();
	slots[idx] = null;
	await db.update(match).set({ slots }).where(eq(match.id, id));
	return 'ok';
}

/**
 * Delete a match. Only the host (slot 0) may delete, and only while no result has been
 * reported. The match's chat is removed alongside it.
 */
export async function deleteMatch(
	id: string,
	userId: string
): Promise<'ok' | 'not-found' | 'not-host' | 'has-result'> {
	const m = await getMatch(id);
	if (!m) return 'not-found';

	const host = m.slots[0];
	if (!host || host.type !== 'user' || host.id !== userId) return 'not-host';

	const results = await db
		.select({ id: matchResult.id })
		.from(matchResult)
		.where(eq(matchResult.matchId, id));
	if (results.length > 0) return 'has-result';

	await db.delete(matchMessage).where(eq(matchMessage.matchId, id));
	await db.delete(match).where(eq(match.id, id));
	return 'ok';
}

export type CreateInput = {
	type: 'singles' | 'doubles';
	locationId: string;
	date: string;
	time: string;
	ntrpMin: number;
	ntrpMax: number;
	notes: string;
	/** invited player ids for the non-host slots; '' means leave open */
	invites: string[];
};

/** Create a new match hosted by the current user. Returns the new match id. */
export async function createMatch(input: CreateInput, hostUserId: string): Promise<string> {
	const slotCount = input.type === 'singles' ? 2 : 4;
	const slots: SlotEntry[] = [{ type: 'user', id: hostUserId }];
	for (let i = 0; i < slotCount - 1; i++) {
		const inv = input.invites[i];
		slots.push(inv ? { type: 'player', id: inv } : null);
	}

	const id = 'u-' + crypto.randomUUID();
	await db.insert(match).values({
		id,
		type: input.type,
		locationId: input.locationId,
		date: input.date,
		time: input.time,
		ntrpMin: input.ntrpMin,
		ntrpMax: input.ntrpMax,
		notes: input.notes,
		slots
	});
	return id;
}

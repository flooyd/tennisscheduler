import { eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { match, matchResult, user, type Match, type SlotEntry } from '$lib/server/db/schema';
import { playerById, colorForId } from '$lib/data';
import type { LadderRow, Reliability } from '$lib/types';

const DEFAULT_NTRP = 3.5;

/** slot[] indexes that make up each side, by match type. */
function sidesOf(m: Match): [number[], number[]] {
	return m.type === 'doubles'
		? [
				[0, 1],
				[2, 3]
			]
		: [[0], [1]];
}

function reliabilityScore(played: number, noShows: number): number | null {
	const total = played + noShows;
	return total === 0 ? null : Math.round((played / total) * 100);
}

type Participant = Exclude<SlotEntry, null>;
type Tally = {
	id: string;
	entry: Participant;
	wins: number;
	losses: number;
	played: number;
	noShows: number;
};

/**
 * Walk every reported result, crediting wins/losses and attendance to the players on each side.
 * Works for both static seed players and real users, so the ladder fills in as results are
 * reported on existing matches — no seeding required.
 */
async function tallyResults(): Promise<Map<string, Tally>> {
	const [matches, results] = await Promise.all([
		db.select().from(match),
		db.select().from(matchResult)
	]);
	const byId = new Map(matches.map((m) => [m.id, m]));
	const tallies = new Map<string, Tally>();

	const get = (entry: Participant): Tally => {
		let t = tallies.get(entry.id);
		if (!t) {
			t = { id: entry.id, entry, wins: 0, losses: 0, played: 0, noShows: 0 };
			tallies.set(entry.id, t);
		}
		return t;
	};

	for (const r of results) {
		const m = byId.get(r.matchId);
		if (!m) continue;
		const [sideA, sideB] = sidesOf(m);
		const noShows = new Set(r.noShows);
		const credit = (idxs: number[], won: boolean) => {
			for (const i of idxs) {
				const entry = m.slots[i];
				if (!entry) continue;
				const t = get(entry);
				if (noShows.has(entry.id)) t.noShows++;
				else {
					t.played++;
					if (won) t.wins++;
					else t.losses++;
				}
			}
		};
		credit(sideA, r.winnerSide === 0);
		credit(sideB, r.winnerSide === 1);
	}

	return tallies;
}

/** Resolve display name/ntrp/image for a set of slot entries (batches the user lookup). */
async function resolveIdentities(entries: SlotEntry[]) {
	const userIds = new Set<string>();
	for (const e of entries) if (e && e.type === 'user') userIds.add(e.id);

	const users = new Map<string, { name: string; ntrp: number; image: string | null }>();
	if (userIds.size > 0) {
		const rows = await db
			.select({ id: user.id, name: user.name, ntrp: user.ntrp, image: user.image })
			.from(user)
			.where(inArray(user.id, [...userIds]));
		for (const r of rows)
			users.set(r.id, { name: r.name, ntrp: r.ntrp ?? DEFAULT_NTRP, image: r.image ?? null });
	}

	return (entry: Participant) => {
		if (entry.type === 'player') {
			const p = playerById(entry.id);
			return {
				name: p?.name ?? 'Player',
				ntrp: p?.ntrp ?? DEFAULT_NTRP,
				color: p?.color ?? colorForId(entry.id),
				image: null as string | null,
				isUser: false
			};
		}
		const u = users.get(entry.id);
		return {
			name: u?.name ?? 'Player',
			ntrp: u?.ntrp ?? DEFAULT_NTRP,
			color: colorForId(entry.id),
			image: u?.image ?? null,
			isUser: true
		};
	};
}

/** Full ranked ladder. Sorted by points, then win %, then matches played. */
export async function buildLadder(currentUserId: string | undefined): Promise<LadderRow[]> {
	const tallies = await tallyResults();
	const resolve = await resolveIdentities([...tallies.values()].map((t) => t.entry));

	const rows: LadderRow[] = [...tallies.values()].map((t) => {
		const who = resolve(t.entry);
		const decided = t.wins + t.losses;
		return {
			id: t.id,
			name: who.name,
			ntrp: who.ntrp,
			color: who.color,
			image: who.image,
			isUser: who.isUser,
			you: t.entry.type === 'user' && t.entry.id === currentUserId,
			wins: t.wins,
			losses: t.losses,
			points: t.wins * 3 + t.losses,
			winPct: decided === 0 ? 0 : Math.round((t.wins / decided) * 100),
			reliability: {
				played: t.played,
				noShows: t.noShows,
				score: reliabilityScore(t.played, t.noShows)
			}
		};
	});

	rows.sort((a, b) => b.points - a.points || b.winPct - a.winPct || b.wins - a.wins);
	return rows;
}

/** Reliability lookup keyed by slot id (player or user), for badges on a match page. */
export async function reliabilityMap(): Promise<Map<string, Reliability>> {
	const tallies = await tallyResults();
	const out = new Map<string, Reliability>();
	for (const t of tallies.values())
		out.set(t.id, {
			played: t.played,
			noShows: t.noShows,
			score: reliabilityScore(t.played, t.noShows)
		});
	return out;
}

/** Replace any prior result for a match with a fresh report. */
export async function reportResult(input: {
	matchId: string;
	reportedBy: string;
	winnerSide: number;
	score: string;
	noShows: string[];
}): Promise<void> {
	await db.delete(matchResult).where(eq(matchResult.matchId, input.matchId));
	await db.insert(matchResult).values({
		id: 'r-' + crypto.randomUUID(),
		matchId: input.matchId,
		reportedBy: input.reportedBy,
		winnerSide: input.winnerSide,
		score: input.score,
		noShows: input.noShows
	});
}

export async function getResult(matchId: string): Promise<MatchResultRow | null> {
	const rows = await db.select().from(matchResult).where(eq(matchResult.matchId, matchId));
	return rows[0] ?? null;
}

type MatchResultRow = typeof matchResult.$inferSelect;

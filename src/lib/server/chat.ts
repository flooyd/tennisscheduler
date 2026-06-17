import { asc, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { matchMessage, user } from '$lib/server/db/schema';
import { colorForId } from '$lib/data';
import type { ChatMessage } from '$lib/types';

/** All messages for a match, oldest first, with author identity resolved. */
export async function listMessages(
	matchId: string,
	currentUserId: string | undefined
): Promise<ChatMessage[]> {
	const rows = await db
		.select()
		.from(matchMessage)
		.where(eq(matchMessage.matchId, matchId))
		.orderBy(asc(matchMessage.createdAt));

	if (rows.length === 0) return [];

	const authorIds = [...new Set(rows.map((r) => r.userId))];
	const users = await db
		.select({ id: user.id, name: user.name, image: user.image })
		.from(user)
		.where(inArray(user.id, authorIds));
	const byId = new Map(users.map((u) => [u.id, u]));

	return rows.map((r) => {
		const u = byId.get(r.userId);
		return {
			id: r.id,
			body: r.body,
			createdAt: r.createdAt.toISOString(),
			author: {
				id: r.userId,
				name: u?.name ?? 'Player',
				color: colorForId(r.userId),
				image: u?.image ?? null,
				you: r.userId === currentUserId
			}
		};
	});
}

/** Post a message. Returns 'ok' or 'empty' when the body is blank. */
export async function postMessage(
	matchId: string,
	userId: string,
	body: string
): Promise<'ok' | 'empty'> {
	const trimmed = body.trim().slice(0, 1000);
	if (!trimmed) return 'empty';
	await db.insert(matchMessage).values({
		id: 'msg-' + crypto.randomUUID(),
		matchId,
		userId,
		body: trimmed
	});
	return 'ok';
}

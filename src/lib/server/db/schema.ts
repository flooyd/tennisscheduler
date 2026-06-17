import { pgTable, text, real, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

/**
 * A slot occupant. `slots[0]` is always the host.
 *  - null              → open slot
 *  - { type:'player' } → a static seed player (see src/lib/data.ts PLAYERS)
 *  - { type:'user' }   → a real Better Auth user (id references the `user` table)
 */
export type SlotEntry = null | { type: 'player'; id: string } | { type: 'user'; id: string };

export const match = pgTable('match', {
	id: text('id').primaryKey(),
	type: text('type').notNull(), // 'singles' | 'doubles'
	locationId: text('location_id').notNull(),
	date: text('date').notNull(), // 'YYYY-MM-DD'
	time: text('time').notNull(), // 'HH:MM'
	ntrpMin: real('ntrp_min').notNull(),
	ntrpMax: real('ntrp_max').notNull(),
	notes: text('notes').notNull().default(''),
	slots: jsonb('slots').$type<SlotEntry[]>().notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export type Match = typeof match.$inferSelect;

/**
 * A reported outcome for a match. One row per match (the reporter's report replaces any
 * earlier one). `winnerSide` is 0 or 1: for singles, side 0 is slot[0] and side 1 is slot[1];
 * for doubles, side 0 is slots[0,1] (Team A) and side 1 is slots[2,3] (Team B) — matching the
 * sides shown on the match detail page. `noShows` holds slot ids (player or user) that didn't
 * turn up, which feeds each player's reliability score.
 */
export const matchResult = pgTable(
	'match_result',
	{
		id: text('id').primaryKey(),
		matchId: text('match_id').notNull(),
		reportedBy: text('reported_by').notNull(),
		winnerSide: integer('winner_side').notNull(),
		score: text('score').notNull().default(''),
		noShows: jsonb('no_shows').$type<string[]>().notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(t) => [index('match_result_matchId_idx').on(t.matchId)]
);

export type MatchResult = typeof matchResult.$inferSelect;

/** A single message in a match's group chat. Only match participants can post. */
export const matchMessage = pgTable(
	'match_message',
	{
		id: text('id').primaryKey(),
		matchId: text('match_id').notNull(),
		userId: text('user_id').notNull(),
		body: text('body').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(t) => [index('match_message_matchId_idx').on(t.matchId)]
);

export type MatchMessage = typeof matchMessage.$inferSelect;

export * from './auth.schema';

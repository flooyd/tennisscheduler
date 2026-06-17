import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { listMatches, upcoming, resolveMatches } from '$lib/server/matches';
import { LOCATIONS, NTRP_LEVELS } from '$lib/data';

export const load: PageServerLoad = async ({ locals }) => {
	// Public page — readable signed-out. We still resolve against the current user
	// (if any) so the "you're in" state and a personalised next-match line work.
	const all = upcoming(await listMatches());
	const resolved = await resolveMatches(all, locals.user?.id);

	const openMatches = resolved.filter((m) => m.openCount > 0);

	const participants = new Set<string>();
	for (const m of resolved) for (const s of m.slots) if (s) participants.add(s.id);

	const next = locals.user ? (resolved.find((m) => m.youIn) ?? null) : null;

	return {
		preview: openMatches.slice(0, 3),
		next,
		stats: {
			openSlots: openMatches.reduce((sum, m) => sum + m.openCount, 0),
			upcoming: resolved.length,
			players: participants.size,
			courts: LOCATIONS.reduce((sum, l) => sum + l.courts, 0),
			venues: LOCATIONS.length,
			ntrpLow: NTRP_LEVELS[0],
			ntrpHigh: NTRP_LEVELS[NTRP_LEVELS.length - 1]
		}
	};
};

export const actions: Actions = {
	signOut: async ({ request }) => {
		await auth.api.signOut({ headers: request.headers });
		redirect(303, '/');
	}
};

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listMatches, upcoming, resolveMatches } from '$lib/server/matches';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/signin');

	const all = upcoming(await listMatches());
	const resolved = await resolveMatches(all, locals.user.id);

	const mine = resolved.filter((m) => m.youIn);
	const open = resolved.filter((m) => !m.youIn && m.openCount > 0).slice(0, 4);

	return {
		mine: mine.slice(0, 3),
		next: mine[0] ?? null,
		open
	};
};

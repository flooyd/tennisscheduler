import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listMatches, upcoming, resolveMatches } from '$lib/server/matches';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/signin');

	const all = upcoming(await listMatches());
	const resolved = await resolveMatches(all, locals.user.id);

	return {
		playing: resolved.filter((m) => m.youIn && !m.isHosting),
		hosting: resolved.filter((m) => m.isHosting)
	};
};

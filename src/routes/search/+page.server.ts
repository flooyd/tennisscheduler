import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listMatches, upcoming, resolveMatches } from '$lib/server/matches';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/signin');

	const all = upcoming(await listMatches());
	const matches = await resolveMatches(all, locals.user.id);
	return { matches };
};

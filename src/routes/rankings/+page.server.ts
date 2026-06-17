import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { buildLadder } from '$lib/server/standings';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/signin');
	const ladder = await buildLadder(locals.user.id);
	return { ladder };
};

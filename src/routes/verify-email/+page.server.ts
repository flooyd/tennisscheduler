import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) redirect(302, '/signin');
	return { email: locals.user.email, verified: locals.user.emailVerified };
};

export const actions: Actions = {
	resend: async ({ locals }) => {
		if (!locals.user) redirect(302, '/signin');
		await auth.api.sendVerificationEmail({
			body: { email: locals.user.email, callbackURL: '/auth/verification-success' }
		});
		return { sent: true };
	}
};

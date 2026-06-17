import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(302, '/dashboard');
	return {};
};

function displayName(name: string, email: string): string {
	const n = name.trim();
	if (n) return n;
	if (email.includes('@')) {
		const local = email
			.split('@')[0]
			.replace(/[._-]+/g, ' ')
			.trim();
		if (local) return local.replace(/\b\w/g, (c) => c.toUpperCase());
	}
	return 'Ace Player';
}

export const actions: Actions = {
	signIn: async ({ request }) => {
		const fd = await request.formData();
		const email = fd.get('email')?.toString() ?? '';
		const password = fd.get('password')?.toString() ?? '';
		try {
			await auth.api.signInEmail({ body: { email, password } });
		} catch (e) {
			if (e instanceof APIError) return fail(400, { message: e.message || 'Sign in failed' });
			return fail(500, { message: 'Unexpected error' });
		}
		redirect(303, '/dashboard');
	},

	signUp: async ({ request }) => {
		const fd = await request.formData();
		const email = fd.get('email')?.toString() ?? '';
		const password = fd.get('password')?.toString() ?? '';
		const name = displayName(fd.get('name')?.toString() ?? '', email);
		const ntrp = parseFloat(fd.get('ntrp')?.toString() ?? '3.5') || 3.5;
		try {
			await auth.api.signUpEmail({ body: { email, password, name, ntrp } });
		} catch (e) {
			if (e instanceof APIError) return fail(400, { message: e.message || 'Sign up failed' });
			return fail(500, { message: 'Unexpected error' });
		}

		// Send the verification email explicitly. better-auth's `sendOnSignUp` doesn't fire
		// reliably through the server-side `signUpEmail` call, so we trigger the same request
		// the resend button and banner use. Failures here shouldn't block registration.
		try {
			await auth.api.sendVerificationEmail({
				body: { email, callbackURL: '/auth/verification-success' }
			});
		} catch (e) {
			console.error('[signup] Failed to send verification email:', e);
		}

		redirect(303, '/verify-email');
	}
};

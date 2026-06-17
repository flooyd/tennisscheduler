import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { sendVerificationEmail } from '$lib/server/email';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: {
		enabled: true,
		// Unverified users are allowed in (we show a reminder banner instead of blocking).
		requireEmailVerification: false
	},
	emailVerification: {
		// We send the verification email explicitly from the sign-up action (sendOnSignUp
		// doesn't fire reliably via the server-side signUpEmail call); keeping this false
		// avoids sending two emails on registration.
		sendOnSignUp: false,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail(user.email, url);
		}
	},
	user: {
		additionalFields: {
			// NTRP skill rating collected at sign-up (2.0–5.5).
			ntrp: {
				type: 'number',
				required: false,
				defaultValue: 3.5,
				input: true
			}
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

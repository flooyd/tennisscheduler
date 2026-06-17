import { env } from '$env/dynamic/private';
import { Resend } from 'resend';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const FROM = env.EMAIL_FROM || 'Tennis Scheduler <onboarding@resend.dev>';

/**
 * Send the email-verification link. If RESEND_API_KEY is not set, this no-ops with a
 * warning so the app stays fully usable in development before the key is configured.
 */
export async function sendVerificationEmail(to: string, url: string) {
	if (!resend) {
		console.warn(
			`[email] RESEND_API_KEY not set — skipping verification email to ${to}. Link: ${url}`
		);
		return;
	}

	try {
		const { data, error } = await resend.emails.send({
			from: FROM,
			to,
			subject: 'Verify your email — Tennis Scheduler',
			html: `
				<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;color:#0C2233">
					<h1 style="font-style:italic;text-transform:uppercase;letter-spacing:-0.015em">Game on.</h1>
					<p>Confirm your email to lock in your spot on the court.</p>
					<p style="margin:28px 0">
						<a href="${url}" style="background:#DFF24B;color:#0C2233;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;text-decoration:none;padding:13px 22px;border-radius:10px;display:inline-block">Verify email</a>
					</p>
					<p style="font-size:12px;color:rgba(12,34,51,0.5)">If you didn't create a Tennis Scheduler account, you can ignore this email.</p>
				</div>
			`
		});

		// The Resend SDK resolves with { data, error } and does NOT throw on API errors
		// (bad `from`, unverified domain, sandbox recipient limits, …). We must inspect
		// `error` ourselves, or failures pass silently and no email is ever delivered.
		if (error) {
			console.error(
				`[email] Resend rejected the verification email to ${to} (from "${FROM}"):`,
				error
			);
		} else {
			console.log(`[email] Verification email sent to ${to} (id: ${data?.id ?? 'unknown'}).`);
		}
	} catch (err) {
		console.error('[email] Failed to send verification email:', err);
	}
}

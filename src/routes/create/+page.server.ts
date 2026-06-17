import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createMatch } from '$lib/server/matches';
import { isoIn, locById } from '$lib/data';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) redirect(302, '/signin');
	return {};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/signin');
		const fd = await request.formData();

		const type = fd.get('type') === 'doubles' ? 'doubles' : 'singles';
		const locationId = fd.get('locationId')?.toString() ?? '';
		const date = fd.get('date')?.toString() ?? '';
		const time = fd.get('time')?.toString() ?? '18:00';
		const ntrpMin = parseFloat(fd.get('ntrpMin')?.toString() ?? '3.0');
		const ntrpMax = parseFloat(fd.get('ntrpMax')?.toString() ?? '4.0');
		const notes = (fd.get('notes')?.toString() ?? '').trim();

		let invites: string[] = [];
		try {
			const parsed = JSON.parse(fd.get('invites')?.toString() ?? '[]');
			if (Array.isArray(parsed)) invites = parsed.map((x) => String(x ?? ''));
		} catch {
			invites = [];
		}

		// Authoritative validation (mirrors the client-side checks).
		if (!locationId || !locById(locationId))
			return fail(400, { message: 'Pick a location for your match.' });
		if (!date || date < isoIn(0)) return fail(400, { message: 'Pick a date — today or later.' });
		if (ntrpMin > ntrpMax)
			return fail(400, { message: 'NTRP range is upside down — min is above max.' });

		const id = await createMatch(
			{ type, locationId, date, time, ntrpMin, ntrpMax, notes, invites },
			locals.user.id
		);
		return { id };
	}
};

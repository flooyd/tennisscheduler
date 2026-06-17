import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { NTRP_LEVELS } from '$lib/data';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) redirect(302, '/signin');
	return {};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/signin');
		const fd = await request.formData();

		const name = (fd.get('name')?.toString() ?? '').trim();
		const ntrp = parseFloat(fd.get('ntrp')?.toString() ?? '');
		const imageRaw = (fd.get('image')?.toString() ?? '').trim();

		const values = { name, ntrp: fd.get('ntrp')?.toString() ?? '', image: imageRaw };

		if (!name) return fail(400, { message: 'Your name can’t be empty.', values });
		if (!NTRP_LEVELS.includes(ntrp))
			return fail(400, { message: 'Pick a valid NTRP rating.', values });

		// Avatar is optional — an empty value falls back to initials. When provided it must be a URL.
		let image: string | null = null;
		if (imageRaw) {
			if (!/^https?:\/\/.+/i.test(imageRaw))
				return fail(400, {
					message: 'Avatar must be a link starting with http:// or https://',
					values
				});
			image = imageRaw;
		}

		await db.update(user).set({ name, ntrp, image }).where(eq(user.id, locals.user.id));
		return { success: true };
	}
};

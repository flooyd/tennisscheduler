import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	const u = locals.user;
	return {
		user: u
			? {
					id: u.id,
					name: u.name,
					email: u.email,
					image: u.image ?? null,
					ntrp: u.ntrp ?? 3.5,
					emailVerified: u.emailVerified
				}
			: null
	};
};

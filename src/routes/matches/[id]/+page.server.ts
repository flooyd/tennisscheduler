import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getMatch, resolveMatches, claimSlot, leaveSlot } from '$lib/server/matches';
import { reliabilityMap, reportResult, getResult } from '$lib/server/standings';
import { listMessages, postMessage } from '$lib/server/chat';
import { canReportResultNow, resultsOpenAt } from '$lib/data';
import type { Reliability } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals, depends }) => {
	if (!locals.user) redirect(302, '/signin');
	depends('match:detail');

	const raw = await getMatch(params.id);
	if (!raw) error(404, 'Match not found');

	const [match] = await resolveMatches([raw], locals.user.id);

	const [rel, result, messages] = await Promise.all([
		reliabilityMap(),
		getResult(params.id),
		listMessages(params.id, locals.user.id)
	]);

	// Only the reliability of this match's participants needs to go to the client.
	const reliability: Record<string, Reliability> = {};
	for (const s of match.slots) if (s && rel.has(s.id)) reliability[s.id] = rel.get(s.id)!;

	// Results can only be logged from 1 hour after the scheduled start.
	const windowOpen = canReportResultNow(match.date, match.time);

	return {
		match,
		reliability,
		messages,
		result: result
			? { winnerSide: result.winnerSide, score: result.score, noShows: result.noShows }
			: null,
		canReport: match.youIn && windowOpen,
		reportOpensAt:
			match.youIn && !windowOpen ? resultsOpenAt(match.date, match.time).toISOString() : null
	};
};

export const actions: Actions = {
	claim: async ({ request, params, locals }) => {
		if (!locals.user) redirect(302, '/signin');
		const fd = await request.formData();
		const idx = Number(fd.get('index'));
		const res = await claimSlot(params.id, idx, locals.user.id);
		const toast =
			res === 'ok'
				? 'You’re in! See you on court.'
				: res === 'already-in'
					? 'You’re already in this match.'
					: res === 'taken'
						? 'That slot was just taken.'
						: 'Match not found.';
		return { toast };
	},

	leave: async ({ request, params, locals }) => {
		if (!locals.user) redirect(302, '/signin');
		const fd = await request.formData();
		const idx = Number(fd.get('index'));
		const res = await leaveSlot(params.id, idx, locals.user.id);
		const toast =
			res === 'ok'
				? 'You left the match.'
				: res === 'is-host'
					? 'Hosts can’t leave their own match.'
					: res === 'not-yours'
						? 'That isn’t your slot.'
						: 'Match not found.';
		return { toast };
	},

	postMessage: async ({ request, params, locals }) => {
		if (!locals.user) redirect(302, '/signin');
		const raw = await getMatch(params.id);
		if (!raw) return fail(404, { toast: 'Match not found.' });
		const inMatch = raw.slots.some((s) => s && s.type === 'user' && s.id === locals.user!.id);
		if (!inMatch) return fail(403, { toast: 'Only players in this match can chat.' });

		const fd = await request.formData();
		const body = fd.get('body')?.toString() ?? '';
		const res = await postMessage(params.id, locals.user.id, body);
		if (res === 'empty') return fail(400, { toast: 'Message can’t be empty.' });
		return { sent: true };
	},

	reportResult: async ({ request, params, locals }) => {
		if (!locals.user) redirect(302, '/signin');
		const raw = await getMatch(params.id);
		if (!raw) return fail(404, { toast: 'Match not found.' });
		const inMatch = raw.slots.some((s) => s && s.type === 'user' && s.id === locals.user!.id);
		if (!inMatch) return fail(403, { toast: 'Only players in this match can report a result.' });
		if (!canReportResultNow(raw.date, raw.time))
			return fail(400, {
				toast: 'You can report the result starting 1 hour after the match begins.'
			});

		const fd = await request.formData();
		const winnerSide = Number(fd.get('winnerSide'));
		if (winnerSide !== 0 && winnerSide !== 1) return fail(400, { toast: 'Pick the winning side.' });
		const score = (fd.get('score')?.toString() ?? '').trim().slice(0, 60);
		const noShows = fd.getAll('noShow').map((v) => v.toString());

		await reportResult({
			matchId: params.id,
			reportedBy: locals.user.id,
			winnerSide,
			score,
			noShows
		});
		return { toast: 'Result recorded — ladder updated.' };
	}
};

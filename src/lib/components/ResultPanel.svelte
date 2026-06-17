<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { ping } from '$lib/stores';
	import type { ResolvedMatch, ResolvedPlayer } from '$lib/types';
	import Btn from './Btn.svelte';

	let {
		match,
		result,
		canReport,
		reportOpensAt = null
	}: {
		match: ResolvedMatch;
		result: { winnerSide: number; score: string; noShows: string[] } | null;
		canReport: boolean;
		/** ISO timestamp when reporting unlocks, when it's still too early (else null). */
		reportOpensAt?: string | null;
	} = $props();

	function fmtOpens(iso: string): string {
		return new Date(iso).toLocaleString([], {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	let editing = $state(false);
	// Initial-only: seed the picker from any existing result; later edits are driven by clicks.
	let winner = $state<number | null>(untrack(() => result?.winnerSide ?? null));

	function sideIdx(side: number): number[] {
		return match.type === 'doubles' ? (side === 0 ? [0, 1] : [2, 3]) : side === 0 ? [0] : [1];
	}
	function sidePlayers(side: number): ResolvedPlayer[] {
		return sideIdx(side)
			.map((i) => match.slots[i])
			.filter((s): s is ResolvedPlayer => s !== null);
	}
	function sideLabel(side: number): string {
		const names = sidePlayers(side).map((p) => (p.you ? 'You' : p.name.split(' ')[0]));
		return names.length ? names.join(' & ') : 'Open side';
	}

	let filled = $derived(match.slots.filter((s): s is ResolvedPlayer => s !== null));
	let tag = $derived(match.type === 'doubles' ? ['Team A', 'Team B'] : ['Host side', 'Challenger']);

	function toastOf(data: unknown, fallback: string): string {
		return (data as { toast?: string } | undefined)?.toast ?? fallback;
	}

	function nameOf(id: string): string {
		const p = filled.find((s) => s.id === id);
		return p ? (p.you ? 'You' : p.name) : 'A player';
	}
</script>

<section class="section">
	<h2 class="disp section-title">Result</h2>
	<div class="result-card card">
		{#if result && !editing}
			<div class="result-final">
				<span class="result-trophy" aria-hidden="true">🏆</span>
				<div>
					<strong class="result-winner">{sideLabel(result.winnerSide)} won</strong>
					<span class="result-loser">def. {sideLabel(result.winnerSide === 0 ? 1 : 0)}</span>
					{#if result.score}<span class="result-score-out">{result.score}</span>{/if}
				</div>
			</div>
			{#if result.noShows.length > 0}
				<p class="result-noshow-out">
					No-show: {result.noShows.map(nameOf).join(', ')}
				</p>
			{/if}
			{#if canReport}
				<Btn kind="ghost" sm onclick={() => (editing = true)}>Update result</Btn>
			{/if}
		{:else if canReport}
			<form
				class="result-form"
				method="post"
				action="?/reportResult"
				use:enhance={() => {
					return async ({ result: r, update }) => {
						if (r.type === 'success') {
							ping(toastOf(r.data, 'Result recorded.'));
							editing = false;
							await invalidate('match:detail');
						} else if (r.type === 'failure') {
							ping(toastOf(r.data, 'Couldn’t save the result.'));
						} else {
							await update();
						}
					};
				}}
			>
				<span class="field-label">Who won?</span>
				<div class="result-sides">
					{#each [0, 1] as side (side)}
						<button
							type="button"
							class="result-side"
							class:on={winner === side}
							onclick={() => (winner = side)}
						>
							<span class="result-side-tag">{tag[side]}</span>
							<strong>{sideLabel(side)}</strong>
						</button>
					{/each}
				</div>
				<input type="hidden" name="winnerSide" value={winner ?? ''} />

				<label class="field">
					<span class="field-label">Score (optional)</span>
					<input name="score" placeholder="e.g. 6-4, 7-5" value={result?.score ?? ''} />
				</label>

				{#if filled.length > 0}
					<span class="field-label">Any no-shows? (affects reliability)</span>
					<div class="result-noshow">
						{#each filled as p (p.id)}
							<label class="check">
								<input
									type="checkbox"
									name="noShow"
									value={p.id}
									checked={result?.noShows.includes(p.id) ?? false}
								/>
								{p.you ? 'You' : p.name}
							</label>
						{/each}
					</div>
				{/if}

				<div class="result-actions">
					{#if result}<Btn kind="ghost" sm onclick={() => (editing = false)}>Cancel</Btn>{/if}
					<Btn kind="primary" sm type="submit" disabled={winner === null}>Save result</Btn>
				</div>
			</form>
		{:else if reportOpensAt}
			<p class="result-empty">
				You can report the result from <strong>{fmtOpens(reportOpensAt)}</strong> — one hour after the
				match starts.
			</p>
		{:else}
			<p class="result-empty">No result reported yet — players can log it once they’ve played.</p>
		{/if}
	</div>
</section>

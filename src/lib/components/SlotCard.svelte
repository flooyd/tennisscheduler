<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { ping } from '$lib/stores';
	import type { Reliability, ResolvedPlayer } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import Btn from './Btn.svelte';
	import ReliabilityBadge from './ReliabilityBadge.svelte';

	let {
		slot,
		index,
		matchType,
		reliability = null
	}: {
		slot: ResolvedPlayer | null;
		index: number;
		matchType: 'singles' | 'doubles';
		reliability?: Reliability | null;
	} = $props();

	let confirming = $state(false);

	let side = $derived(
		matchType === 'doubles'
			? index < 2
				? 'Team A'
				: 'Team B'
			: index === 0
				? 'Host side'
				: 'Challenger'
	);

	function toastOf(data: unknown, fallback: string): string {
		return (data as { toast?: string } | undefined)?.toast ?? fallback;
	}
</script>

{#if slot}
	<div class="slot-card" class:slot-you={slot.you}>
		<span class="slot-side">{side}</span>
		<Avatar player={slot} size={52} />
		<span class="slot-name">{slot.name}{slot.you ? ' (you)' : ''}</span>
		<span class="slot-meta">NTRP {slot.ntrp.toFixed(1)}{slot.isHost ? ' · Host' : ''}</span>
		<ReliabilityBadge rel={reliability} compact />
		{#if slot.you && !slot.isHost}
			<form
				method="post"
				action="?/leave"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							ping(toastOf(result.data, 'You left the match.'));
							await invalidateAll();
						} else {
							await update();
						}
					};
				}}
			>
				<input type="hidden" name="index" value={index} />
				<Btn kind="ghost" sm type="submit">Leave match</Btn>
			</form>
		{/if}
	</div>
{:else}
	<div class="slot-card slot-open-card">
		<span class="slot-side">{side}</span>
		<Avatar player={null} size={52} />
		<span class="slot-name muted">Open slot</span>
		{#if confirming}
			<form
				method="post"
				action="?/claim"
				class="slot-confirm"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							ping(toastOf(result.data, 'You’re in! See you on court.'));
							confirming = false;
							await invalidateAll();
						} else {
							await update();
						}
					};
				}}
			>
				<input type="hidden" name="index" value={index} />
				<Btn kind="primary" sm type="submit">Confirm</Btn>
				<Btn kind="ghost" sm onclick={() => (confirming = false)}>Cancel</Btn>
			</form>
		{:else}
			<Btn kind="ink" sm onclick={() => (confirming = true)}>Claim slot</Btn>
		{/if}
	</div>
{/if}

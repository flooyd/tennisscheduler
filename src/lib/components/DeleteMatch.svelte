<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { ping } from '$lib/stores';
	import Btn from './Btn.svelte';

	let { canDelete }: { canDelete: boolean } = $props();

	let confirming = $state(false);

	function toastOf(data: unknown, fallback: string): string {
		return (data as { toast?: string } | undefined)?.toast ?? fallback;
	}
</script>

<section class="section">
	<h2 class="disp section-title">Host controls</h2>
	<div class="danger-zone card">
		{#if canDelete}
			<div class="danger-info">
				<strong>Delete this match</strong>
				<span>Removes it for everyone, along with its chat. You can’t undo this.</span>
			</div>
			{#if confirming}
				<form
					method="post"
					action="?/deleteMatch"
					class="danger-confirm"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'redirect') {
								ping('Match deleted.');
								goto(result.location);
							} else if (result.type === 'failure') {
								ping(toastOf(result.data, 'Couldn’t delete the match.'));
								confirming = false;
							} else {
								await update();
							}
						};
					}}
				>
					<Btn kind="ghost" sm onclick={() => (confirming = false)}>Cancel</Btn>
					<Btn kind="danger" sm type="submit">Yes, delete</Btn>
				</form>
			{:else}
				<Btn kind="danger" sm onclick={() => (confirming = true)}>Delete match</Btn>
			{/if}
		{:else}
			<div class="danger-info">
				<strong>Delete this match</strong>
				<span>A result has been posted, so this match can no longer be deleted.</span>
			</div>
		{/if}
	</div>
</section>

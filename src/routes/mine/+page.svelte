<script lang="ts">
	import Seg from '$lib/components/Seg.svelte';
	import MatchCard from '$lib/components/MatchCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let tab = $state('playing');
	let list = $derived(tab === 'playing' ? data.playing : data.hosting);
</script>

<svelte:head>
	<title>My matches — Tennis Scheduler</title>
</svelte:head>

<main class="page">
	<h1 class="disp page-title">My matches</h1>

	<Seg
		options={[
			{ value: 'playing', label: 'Playing (' + data.playing.length + ')' },
			{ value: 'hosting', label: 'Hosting (' + data.hosting.length + ')' }
		]}
		value={tab}
		onChange={(v) => (tab = v)}
	/>

	<div style="height:18px"></div>

	{#if list.length === 0}
		<EmptyState
			title={tab === 'playing' ? 'Nothing on your calendar' : 'You haven’t hosted yet'}
			body={tab === 'playing'
				? 'Join an open match or schedule your own.'
				: 'Post a match and the players will come to you.'}
		>
			{#snippet action()}
				<Btn kind="ink" href={tab === 'playing' ? '/search' : '/create'}>
					{tab === 'playing' ? 'Find a match' : 'Schedule a match'}
				</Btn>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="match-list">
			{#each list as m (m.id)}<MatchCard {m} />{/each}
		</div>
	{/if}
</main>

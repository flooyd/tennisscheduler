<script lang="ts">
	import { LOCATIONS, isoIn } from '$lib/data';
	import Seg from '$lib/components/Seg.svelte';
	import MatchCard from '$lib/components/MatchCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let type = $state('all');
	let locId = $state('all');
	let when = $state('any');
	let openOnly = $state(true);

	const horizon: Record<string, number> = { any: 9999, today: 0, three: 3, week: 7 };

	let results = $derived(
		data.matches.filter((m) => {
			if (type !== 'all' && m.type !== type) return false;
			if (locId !== 'all' && m.location.id !== locId) return false;
			if (m.date > isoIn(horizon[when])) return false;
			if (openOnly && m.openCount === 0) return false;
			return true;
		})
	);
</script>

<svelte:head>
	<title>Find a match — Tennis Scheduler</title>
</svelte:head>

<main class="page">
	<h1 class="disp page-title">Find a match</h1>

	<div class="filter-bar card">
		<Seg
			options={[
				{ value: 'all', label: 'All' },
				{ value: 'singles', label: 'Singles' },
				{ value: 'doubles', label: 'Doubles' }
			]}
			value={type}
			onChange={(v) => (type = v)}
		/>
		<select class="filter-sel" bind:value={locId}>
			<option value="all">All locations</option>
			{#each LOCATIONS as l (l.id)}<option value={l.id}>{l.name}</option>{/each}
		</select>
		<select class="filter-sel" bind:value={when}>
			<option value="any">Any day</option>
			<option value="today">Today</option>
			<option value="three">Next 3 days</option>
			<option value="week">This week</option>
		</select>
		<label class="check">
			<input type="checkbox" bind:checked={openOnly} />
			<span>Open slots only</span>
		</label>
	</div>

	<p class="result-count">{results.length} {results.length === 1 ? 'match' : 'matches'}</p>

	{#if results.length === 0}
		<EmptyState
			title="No matches found"
			body="Try widening your filters — or post your own match and let players come to you."
		>
			{#snippet action()}
				<Btn kind="ink" href="/create">Schedule a match</Btn>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="match-list">
			{#each results as m (m.id)}<MatchCard {m} />{/each}
		</div>
	{/if}
</main>

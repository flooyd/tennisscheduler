<script lang="ts">
	import { fmtDate, fmtTime } from '$lib/data';
	import Btn from '$lib/components/Btn.svelte';
	import CourtSvg from '$lib/components/CourtSvg.svelte';
	import MatchCard from '$lib/components/MatchCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let firstName = $derived(data.user?.name.split(' ')[0] ?? 'Player');
</script>

<svelte:head>
	<title>Dashboard — Tennis Scheduler</title>
</svelte:head>

<main class="page">
	<section class="hero card-blue">
		<CourtSvg class="hero-court" lineOp={0.5} ball={false} />
		<div class="hero-inner">
			<h1 class="disp hero-title">Game on, {firstName}.</h1>
			{#if data.next}
				<p class="hero-sub">
					Your next match is <strong
						>{fmtDate(data.next.date).toLowerCase() === 'today'
							? 'today'
							: fmtDate(data.next.date)}</strong
					>
					at {fmtTime(data.next.time)} — {data.next.location.name}.
				</p>
			{:else}
				<p class="hero-sub">No matches on your calendar yet. Time to fix that.</p>
			{/if}
			<div class="hero-actions">
				<Btn kind="primary" href="/create">Schedule a match</Btn>
				<Btn kind="white" href="/search">Find a match</Btn>
			</div>
		</div>
	</section>

	{#if data.mine.length > 0}
		<section class="section">
			<div class="section-head">
				<h2 class="disp section-title">Your matches</h2>
				<a class="link" href="/mine">See all</a>
			</div>
			<div class="match-list">
				{#each data.mine as m (m.id)}<MatchCard {m} />{/each}
			</div>
		</section>
	{/if}

	<section class="section">
		<div class="section-head">
			<h2 class="disp section-title">Open matches near you</h2>
			<a class="link" href="/search">Browse all</a>
		</div>
		{#if data.open.length > 0}
			<div class="match-list">
				{#each data.open as m (m.id)}<MatchCard {m} />{/each}
			</div>
		{:else}
			<p class="mc-meta">No open matches right now — be the first to post one.</p>
		{/if}
	</section>
</main>

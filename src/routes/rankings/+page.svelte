<script lang="ts">
	import CourtSvg from '$lib/components/CourtSvg.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import ReliabilityBadge from '$lib/components/ReliabilityBadge.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import { openTutorial } from '$lib/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Rankings — Tennis Scheduler</title>
</svelte:head>

<main class="page">
	<header class="hero card-blue">
		<CourtSvg class="hero-court" lineOp={0.5} ball={false} />
		<div class="hero-inner">
			<h1 class="disp hero-title">Rankings ladder</h1>
			<p class="hero-sub">
				Win matches and report the score to climb. Points are <strong>3 per win</strong> and
				<strong>1 per loss</strong>.
			</p>
		</div>
	</header>

	<section class="section">
		<div class="section-head">
			<h2 class="disp section-title">
				Standings
				{#if data.ladder.length > 0}<span class="count-pill">{data.ladder.length}</span>{/if}
			</h2>
			<button type="button" class="link" onclick={openTutorial}>How scoring works</button>
		</div>

		{#if data.ladder.length === 0}
			<EmptyState
				title="No results yet"
				body="The ladder fills in as players report match results. Play a match, then log who won — no setup needed."
			>
				{#snippet action()}
					<Btn kind="primary" href="/search">Find a match</Btn>
				{/snippet}
			</EmptyState>
		{:else}
			<div class="ladder card">
				<div class="ladder-row ladder-head">
					<span>#</span>
					<span>Player</span>
					<span class="ladder-num">W–L</span>
					<span class="ladder-num ladder-winpct">Win%</span>
					<span class="ladder-num">Pts</span>
				</div>
				{#each data.ladder as row, i (row.id)}
					<div class="ladder-row" class:you={row.you}>
						<span class="ladder-rank">{i + 1}</span>
						<span class="ladder-player">
							<Avatar
								player={{ name: row.name, color: row.color, image: row.image, you: row.you }}
								size={38}
							/>
							<span class="ladder-id">
								<strong>{row.name}{row.you ? ' (you)' : ''}</strong>
								<span class="ladder-sub">
									NTRP {row.ntrp.toFixed(1)} · <ReliabilityBadge rel={row.reliability} compact />
								</span>
							</span>
						</span>
						<span class="ladder-num">{row.wins}–{row.losses}</span>
						<span class="ladder-num ladder-winpct">{row.winPct}%</span>
						<span class="ladder-num ladder-pts">{row.points}</span>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</main>

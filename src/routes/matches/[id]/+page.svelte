<script lang="ts">
	import { fmtDate, fmtTime } from '$lib/data';
	import CourtSvg from '$lib/components/CourtSvg.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import NtrpBadge from '$lib/components/NtrpBadge.svelte';
	import SlotCard from '$lib/components/SlotCard.svelte';
	import ResultPanel from '$lib/components/ResultPanel.svelte';
	import MatchChat from '$lib/components/MatchChat.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let m = $derived(data.match);
	let filled = $derived(m.slots.length - m.openCount);

	function back() {
		if (history.length > 1) history.back();
		else location.assign('/search');
	}
</script>

<svelte:head>
	<title>{m.location.name} — Tennis Scheduler</title>
</svelte:head>

<main class="page">
	<button type="button" class="link back" onclick={back}>← Back</button>

	<header class="detail-head card-blue">
		<CourtSvg class="hero-court" lineOp={0.45} ball={false} />
		<div class="detail-head-inner">
			<div class="mc-row1">
				<TypeBadge type={m.type} />
				<NtrpBadge min={m.ntrp[0]} max={m.ntrp[1]} />
				{#if m.youIn}<span class="badge badge-you">You’re in</span>{/if}
			</div>
			<h1 class="disp detail-title">{fmtDate(m.date)} · {fmtTime(m.time)}</h1>
			<p class="detail-sub">{m.location.name} · Hosted by {m.hostName}</p>
		</div>
	</header>

	<div class="detail-grid">
		<section class="section">
			<h2 class="disp section-title">
				Players <span class="count-pill">{filled}/{m.slots.length}</span>
			</h2>
			<div class="slot-grid">
				{#each m.slots as slot, i (i)}
					<SlotCard
						{slot}
						index={i}
						matchType={m.type}
						reliability={slot ? (data.reliability[slot.id] ?? null) : null}
					/>
				{/each}
			</div>
			{#if m.notes}
				<div class="notes card">
					<span class="field-label">From the host</span>
					<p>{m.notes}</p>
				</div>
			{/if}

			<ResultPanel
				match={m}
				result={data.result}
				canReport={data.canReport}
				reportOpensAt={data.reportOpensAt}
			/>

			<MatchChat messages={data.messages} canPost={m.youIn} />
		</section>

		<aside class="section">
			<h2 class="disp section-title">Location</h2>
			<div class="loc-card card">
				<div class="loc-map">
					<CourtSvg lineOp={0.85} ball={false} />
				</div>
				<div class="loc-card-body">
					<strong>{m.location.name}</strong>
					<span>{m.location.kind} · {m.location.area}</span>
					<span>{m.location.courts} courts · {m.location.surface}</span>
				</div>
			</div>
		</aside>
	</div>
</main>

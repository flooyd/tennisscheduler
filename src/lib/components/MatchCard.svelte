<script lang="ts">
	import { fmtDate, fmtTime, dateParts } from '$lib/data';
	import type { ResolvedMatch } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import TypeBadge from './TypeBadge.svelte';
	import NtrpBadge from './NtrpBadge.svelte';

	let { m }: { m: ResolvedMatch } = $props();

	let parts = $derived(dateParts(m.date));
</script>

<a class="match-card" href="/matches/{m.id}">
	<span class="mc-date">
		<span class="mc-dow">{parts.dow}</span>
		<span class="mc-day">{parts.day}</span>
		<span class="mc-mon">{parts.mon}</span>
	</span>
	<span class="mc-body">
		<span class="mc-row1">
			<TypeBadge type={m.type} />
			<NtrpBadge min={m.ntrp[0]} max={m.ntrp[1]} />
			{#if m.youIn}<span class="badge badge-you">You’re in</span>{/if}
		</span>
		<span class="mc-loc">{m.location.name}</span>
		<span class="mc-meta">{fmtDate(m.date)} · {fmtTime(m.time)} · {m.location.area}</span>
	</span>
	<span class="mc-side">
		<span class="slot-dots">
			{#each m.slots as s, i (i)}<Avatar player={s} size={30} />{/each}
		</span>
		<span class="mc-open" class:full={m.openCount === 0}>
			{m.openCount === 0
				? 'Full'
				: m.openCount + (m.openCount === 1 ? ' spot open' : ' spots open')}
		</span>
	</span>
</a>

<script lang="ts">
	import type { Reliability } from '$lib/types';

	let { rel = null, compact = false }: { rel?: Reliability | null; compact?: boolean } = $props();

	let tier = $derived(
		!rel || rel.score === null ? 'new' : rel.score >= 90 ? 'high' : rel.score >= 70 ? 'mid' : 'low'
	);
	let label = $derived(!rel || rel.score === null ? 'New' : `${rel.score}% reliable`);
	let title = $derived(
		!rel || rel.score === null
			? 'No reported matches yet'
			: `Turned up to ${rel.played} of ${rel.played + rel.noShows} reported matches`
	);
</script>

<span class="rel rel-{tier}" class:rel-compact={compact} {title}>
	<span class="rel-dot"></span>{compact && rel && rel.score !== null ? `${rel.score}%` : label}
</span>

<script lang="ts">
	import BallDot from './BallDot.svelte';

	let { light = false, size }: { light?: boolean; size?: number } = $props();
</script>

<span class="ts-logo" class:light style={size ? `font-size:${size}px` : undefined}>
	<BallDot size={size ? size * 0.85 : 16} />
	<span>Tennis&nbsp;Scheduler</span>
</span>

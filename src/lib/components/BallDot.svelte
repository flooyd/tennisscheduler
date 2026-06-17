<script lang="ts">
	let { size = 12 }: { size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" style="flex:none" aria-hidden="true">
	<circle cx="12" cy="12" r="11" fill="var(--ball)" stroke="var(--ball-deep)" stroke-width="1.5" />
	<path d="M4 5 C 10 9, 10 15, 4 19" fill="none" stroke="#fff" stroke-width="1.6" />
	<path d="M20 5 C 14 9, 14 15, 20 19" fill="none" stroke="#fff" stroke-width="1.6" />
</svg>

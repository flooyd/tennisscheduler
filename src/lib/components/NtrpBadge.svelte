<script lang="ts">
	let { min, max }: { min: number; max: number } = $props();
</script>

<span class="ntrp">NTRP {min.toFixed(1)}–{max.toFixed(1)}</span>

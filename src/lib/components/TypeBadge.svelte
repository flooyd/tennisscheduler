<script lang="ts">
	let { type }: { type: 'singles' | 'doubles' } = $props();
</script>

<span class="badge badge-{type}">{type === 'singles' ? 'Singles' : 'Doubles'}</span>

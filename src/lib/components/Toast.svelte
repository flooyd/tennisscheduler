<script lang="ts">
	import { toast } from '$lib/stores';
	import BallDot from './BallDot.svelte';
</script>

{#if $toast}
	<div class="toast"><BallDot size={16} />{$toast}</div>
{/if}

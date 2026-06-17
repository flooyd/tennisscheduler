<script lang="ts">
	import type { Snippet } from 'svelte';
	import BallDot from './BallDot.svelte';

	let { title, body, action }: { title: string; body: string; action?: Snippet } = $props();
</script>

<div class="empty">
	<BallDot size={28} />
	<h3>{title}</h3>
	<p>{body}</p>
	{#if action}{@render action()}{/if}
</div>

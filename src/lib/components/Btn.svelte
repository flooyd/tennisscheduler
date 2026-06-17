<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		kind?: 'primary' | 'ink' | 'white' | 'ghost' | 'danger';
		sm?: boolean;
		href?: string;
		type?: 'button' | 'submit';
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		style?: string;
		formaction?: string;
		children: Snippet;
	};

	let {
		kind = 'primary',
		sm = false,
		href,
		type = 'button',
		disabled = false,
		onclick,
		style,
		formaction,
		children
	}: Props = $props();

	let cls = $derived('btn btn-' + kind + (sm ? ' btn-sm' : ''));
</script>

{#if href}
	<a class={cls} {href} {style}>{@render children()}</a>
{:else}
	<button class={cls} {type} {disabled} {onclick} {style} {formaction}>{@render children()}</button>
{/if}

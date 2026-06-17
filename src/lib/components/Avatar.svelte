<script lang="ts">
	type AvatarPlayer = { name: string; color?: string; you?: boolean; image?: string | null };

	let { player = null, size = 36 }: { player?: AvatarPlayer | null; size?: number } = $props();

	let initials = $derived(
		player
			? player.name
					.split(' ')
					.map((w) => w[0])
					.slice(0, 2)
					.join('')
			: ''
	);
</script>

{#if player}
	{#if player.image}
		<img
			class="avatar"
			class:you={player.you}
			src={player.image}
			alt={player.name}
			title={player.name}
			style="width:{size}px;height:{size}px"
		/>
	{:else}
		<span
			class="avatar"
			class:you={player.you}
			style="width:{size}px;height:{size}px;font-size:{size * 0.36}px;background:{player.you
				? 'var(--ball)'
				: player.color};color:{player.you ? 'var(--ink)' : '#fff'}"
			title={player.name}>{initials}</span
		>
	{/if}
{:else}
	<span class="avatar open-slot" style="width:{size}px;height:{size}px;font-size:{size * 0.42}px"
		>+</span
	>
{/if}

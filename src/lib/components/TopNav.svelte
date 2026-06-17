<script lang="ts">
	import { page } from '$app/state';
	import { openTutorial } from '$lib/stores';
	import Logo from './Logo.svelte';
	import Avatar from './Avatar.svelte';
	import Btn from './Btn.svelte';

	let { user }: { user: { name: string; ntrp: number; image?: string | null } } = $props();

	let menu = $state(false);
	let menuRoot = $state<HTMLElement>();

	const links = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/search', label: 'Find a match' },
		{ href: '/mine', label: 'My matches' },
		{ href: '/rankings', label: 'Rankings' }
	];

	function isActive(href: string) {
		const p = page.url.pathname;
		return href === '/' ? p === '/' : p.startsWith(href);
	}
</script>

<svelte:window
	onclick={(e) => {
		if (menuRoot && !menuRoot.contains(e.target as Node)) menu = false;
	}}
/>

<header class="nav">
	<a class="nav-logo" href="/"><Logo /></a>
	<nav class="nav-links">
		{#each links as l (l.href)}
			<a href={l.href} class:on={isActive(l.href)}>{l.label}</a>
		{/each}
	</nav>
	<div class="nav-right">
		<Btn kind="primary" sm href="/create">+ New match</Btn>
		<div class="nav-user" bind:this={menuRoot}>
			<button type="button" class="nav-ava" onclick={() => (menu = !menu)}>
				<Avatar player={{ name: user.name, image: user.image, you: true }} size={36} />
			</button>
			{#if menu}
				<div class="nav-menu">
					<div class="nav-menu-name">
						{user.name}<span>NTRP {user.ntrp.toFixed(1)}</span>
					</div>
					<a class="nav-menu-link" href="/settings">Settings</a>
					<button
						type="button"
						class="nav-menu-link"
						onclick={() => {
							menu = false;
							openTutorial();
						}}>How it works</button
					>
					<form method="post" action="/?/signOut">
						<button type="submit">Sign out</button>
					</form>
				</div>
			{/if}
		</div>
	</div>
</header>

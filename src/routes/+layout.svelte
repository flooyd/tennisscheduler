<script lang="ts">
	import '$lib/styles/app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { consumeToast, maybeShowTutorial, ping } from '$lib/stores';
	import Toast from '$lib/components/Toast.svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import TutorialModal from '$lib/components/TutorialModal.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	onMount(() => {
		consumeToast();
		if (data.user) maybeShowTutorial();
	});

	let showBanner = $derived(
		!!data.user && !data.user.emailVerified && page.url.pathname !== '/verify-email'
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-root">
	{#if data.user}
		<TopNav user={data.user} />
		{#if showBanner}
			<div class="verify-banner">
				<span>Confirm your email to secure your account.</span>
				<form
					method="post"
					action="/verify-email?/resend"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								ping('Verification email sent — check your inbox.');
								goto('/verify-email');
							} else if (result.type === 'failure' || result.type === 'error') {
								ping('Couldn’t send the email — please try again.');
							} else {
								await update();
							}
						};
					}}
				>
					<button type="submit">Verify now →</button>
				</form>
			</div>
		{/if}
	{/if}

	{@render children()}

	{#if data.user}
		<TutorialModal />
	{/if}

	<Toast />
</div>

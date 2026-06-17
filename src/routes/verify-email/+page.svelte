<script lang="ts">
	import { enhance } from '$app/forms';
	import { ping } from '$lib/stores';
	import BallDot from '$lib/components/BallDot.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Verify your email — Tennis Scheduler</title>
</svelte:head>

<main class="page">
	<div class="verify-screen">
		<BallDot size={36} />
		{#if data.verified}
			<h1 class="disp">You’re all set.</h1>
			<p>Your email is verified — game on.</p>
			<Btn kind="primary" href="/dashboard">Go to dashboard</Btn>
		{:else}
			<h1 class="disp">Check your email.</h1>
			<p>
				We sent a verification link to <strong>{data.email}</strong>. Click it to confirm your
				account.
			</p>
			<form
				method="post"
				action="?/resend"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') ping('Verification email sent.');
						else await update();
					};
				}}
			>
				<Btn kind="ink" type="submit">Resend email</Btn>
			</form>
			<Btn kind="ghost" href="/dashboard">Continue to app</Btn>
			<p class="muted">You can keep using Tennis Scheduler while you verify.</p>
		{/if}
	</div>
</main>

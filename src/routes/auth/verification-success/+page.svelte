<script lang="ts">
	import BallDot from '$lib/components/BallDot.svelte';
	import Btn from '$lib/components/Btn.svelte';
</script>

<svelte:head>
	<title>Email verified — Tennis Scheduler</title>
</svelte:head>

<main class="page">
	<div class="verify-screen">
		<BallDot size={36} />
		<h1 class="disp">Email verified.</h1>
		<p>Your account is confirmed. Time to step on court.</p>
		<Btn kind="primary" href="/dashboard">Go to dashboard</Btn>
	</div>
</main>

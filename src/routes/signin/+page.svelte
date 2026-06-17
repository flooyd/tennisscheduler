<script lang="ts">
	import { page } from '$app/state';
	import CourtSvg from '$lib/components/CourtSvg.svelte';
	import SignCard from '$lib/components/SignCard.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let signup = $derived(page.url.searchParams.get('mode') === 'signup');
</script>

<svelte:head>
	<title>Sign in — Tennis Scheduler</title>
</svelte:head>

<div class="landing landing-centercourt">
	<CourtSvg class="court-bg" lineOp={0.9} />
	<div class="landing-center">
		<SignCard {form} {signup} />
	</div>
</div>

<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { ping } from '$lib/stores';
	import { NTRP_LEVELS } from '$lib/data';
	import Logo from './Logo.svelte';
	import Seg from './Seg.svelte';
	import Field from './Field.svelte';
	import Btn from './Btn.svelte';

	let {
		form,
		dark = false,
		signup = false
	}: { form?: { message?: string } | null; dark?: boolean; signup?: boolean } = $props();

	let mode = $state<'in' | 'up'>(untrack(() => (signup ? 'up' : 'in')));
	let name = $state('');
	let email = $state('');
	let ntrp = $state('3.5');

	function firstNameGuess() {
		const n = name.trim();
		if (n) return n.split(' ')[0];
		if (email.includes('@')) {
			const local = email
				.split('@')[0]
				.replace(/[._-]+/g, ' ')
				.trim();
			if (local) return local.charAt(0).toUpperCase() + local.slice(1);
		}
		return 'Ace';
	}
</script>

<form
	class="sign-card"
	class:dark
	method="post"
	action={mode === 'in' ? '?/signIn' : '?/signUp'}
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				// ping (not queueToast): the redirect is handled by a client-side goto, so the layout
				// never remounts and a sessionStorage-queued toast would never be consumed.
				ping(
					mode === 'up'
						? 'Verification email sent — check your inbox.'
						: 'Welcome to the court, ' + firstNameGuess() + '!'
				);
				await invalidateAll();
				goto(result.location);
			} else {
				await update();
			}
		};
	}}
>
	<Logo light={dark} />
	<h1 class="disp sign-title">Game on.</h1>
	<p class="sign-sub">Schedule matches, find players, claim your court.</p>

	<Seg
		options={[
			{ value: 'in', label: 'Sign in' },
			{ value: 'up', label: 'Create account' }
		]}
		value={mode}
		onChange={(v) => (mode = v as 'in' | 'up')}
	/>

	{#if mode === 'up'}
		<Field label="Name">
			<input type="text" name="name" placeholder="Serena Smith" bind:value={name} />
		</Field>
	{/if}
	<Field label="Email">
		<input type="email" name="email" placeholder="you@club.com" bind:value={email} required />
	</Field>
	<Field label="Password">
		<input type="password" name="password" placeholder="••••••••" required />
	</Field>
	{#if mode === 'up'}
		<Field label="Your NTRP level" hint="Not sure? 3.0 is a solid recreational player.">
			<select name="ntrp" bind:value={ntrp}>
				{#each NTRP_LEVELS as l (l)}<option value={l}>{l.toFixed(1)}</option>{/each}
			</select>
		</Field>
	{/if}

	{#if form?.message}<p class="sign-error">{form.message}</p>{/if}

	<Btn kind="primary" type="submit" style="width:100%;margin-top:6px">
		{mode === 'in' ? 'Step on court' : 'Join the league'}
	</Btn>
	<p class="sign-fine">Demo — any credentials work.</p>
</form>

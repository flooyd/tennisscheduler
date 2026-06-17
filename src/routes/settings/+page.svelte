<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { queueToast } from '$lib/stores';
	import { NTRP_LEVELS } from '$lib/data';
	import Field from '$lib/components/Field.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Seed the editable fields once from the loaded profile; edits are local from here on.
	let name = $state(untrack(() => data.user?.name ?? ''));
	let ntrp = $state(untrack(() => (data.user?.ntrp ?? 3.5).toFixed(1)));
	let image = $state(untrack(() => data.user?.image ?? ''));
	let error = $state('');

	let previewName = $derived(name.trim() || 'You');
	let previewImage = $derived(image.trim() || null);
</script>

<svelte:head>
	<title>Profile settings — Tennis Scheduler</title>
</svelte:head>

<main class="page page-narrow">
	<h1 class="disp page-title">Profile settings</h1>

	<form
		class="create-form"
		method="post"
		action="?/save"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success') {
					error = '';
					queueToast('Profile updated.');
					await update({ reset: false });
				} else if (result.type === 'failure') {
					error = (result.data as { message?: string })?.message ?? 'Something went wrong.';
				} else {
					await update();
				}
			};
		}}
	>
		<section class="card form-card">
			<h2 class="form-step"><span class="step-num">1</span>You</h2>
			<div class="settings-preview">
				<Avatar player={{ name: previewName, image: previewImage, you: true }} size={64} />
				<div>
					<strong>{previewName}</strong>
					<span class="slot-preview-label">NTRP {ntrp}</span>
				</div>
			</div>
			<Field label="Name">
				<input type="text" name="name" bind:value={name} maxlength="60" placeholder="Your name" />
			</Field>
			<Field label="NTRP rating">
				<select name="ntrp" bind:value={ntrp}>
					{#each NTRP_LEVELS as l (l)}<option value={l.toFixed(1)}>{l.toFixed(1)}</option>{/each}
				</select>
			</Field>
		</section>

		<section class="card form-card">
			<h2 class="form-step"><span class="step-num">2</span>Avatar</h2>
			<p class="form-hint">
				Paste a link to an image. Leave it blank to use your initials instead.
			</p>
			<Field label="Image URL (optional)">
				<input
					type="url"
					name="image"
					bind:value={image}
					placeholder="https://example.com/me.jpg"
				/>
			</Field>
		</section>

		{#if error}<p class="form-error">{error}</p>{/if}
		<div class="form-actions">
			<Btn kind="ghost" href="/dashboard">Cancel</Btn>
			<Btn kind="primary" type="submit">Save changes</Btn>
		</div>
	</form>
</main>

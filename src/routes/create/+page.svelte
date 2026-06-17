<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { queueToast } from '$lib/stores';
	import { LOCATIONS, NTRP_LEVELS, isoIn, fmtTime } from '$lib/data';
	import Seg from '$lib/components/Seg.svelte';
	import Field from '$lib/components/Field.svelte';
	import Btn from '$lib/components/Btn.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let type = $state<'singles' | 'doubles'>('singles');
	let date = $state(isoIn(1));
	let time = $state('18:00');
	let locId = $state('');
	let lo = $state('3.0');
	let hi = $state('4.0');
	let notes = $state('');
	let error = $state('');

	let slotCount = $derived(type === 'singles' ? 2 : 4);
	let openIdx = $derived(Array.from({ length: slotCount - 1 }, (_, i) => i));
	let userName = $derived(data.user?.name ?? 'You');

	const times: string[] = [];
	for (let h = 7; h <= 21; h++) {
		times.push(String(h).padStart(2, '0') + ':00');
		times.push(String(h).padStart(2, '0') + ':30');
	}
	const min = isoIn(0);

	function validate(): boolean {
		if (!locId) {
			error = 'Pick a location for your match.';
			return false;
		}
		if (!date || date < min) {
			error = 'Pick a date — today or later.';
			return false;
		}
		if (parseFloat(lo) > parseFloat(hi)) {
			error = 'NTRP range is upside down — min is above max.';
			return false;
		}
		error = '';
		return true;
	}
</script>

<svelte:head>
	<title>Schedule a match — Tennis Scheduler</title>
</svelte:head>

<main class="page page-narrow">
	<h1 class="disp page-title">Schedule a match</h1>

	<form
		class="create-form"
		method="post"
		action="?/create"
		use:enhance={({ cancel, formData }) => {
			if (!validate()) {
				cancel();
				return;
			}
			formData.set('type', type);
			formData.set('date', date);
			formData.set('time', time);
			formData.set('locationId', locId);
			formData.set('ntrpMin', lo);
			formData.set('ntrpMax', hi);
			formData.set('notes', notes);
			return async ({ result, update }) => {
				if (result.type === 'success' && result.data?.id) {
					queueToast('Match posted — your slots are live.');
					goto('/matches/' + result.data.id);
				} else if (result.type === 'failure') {
					error = (result.data as { message?: string })?.message ?? 'Something went wrong.';
				} else {
					await update();
				}
			};
		}}
	>
		<section class="card form-card">
			<h2 class="form-step"><span class="step-num">1</span>Format</h2>
			<Seg
				big
				options={[
					{ value: 'singles', label: 'Singles · 2 players' },
					{ value: 'doubles', label: 'Doubles · 4 players' }
				]}
				value={type}
				onChange={(v) => (type = v as 'singles' | 'doubles')}
			/>
			<div class="slot-preview">
				<Avatar player={{ name: userName, you: true }} size={40} />
				{#each openIdx as i (i)}
					<Avatar player={null} size={40} />
				{/each}
				<span class="slot-preview-label"
					>You're in — {openIdx.length} open {openIdx.length === 1 ? 'slot' : 'slots'} for anyone to claim</span
				>
			</div>
		</section>

		<section class="card form-card">
			<h2 class="form-step"><span class="step-num">2</span>When</h2>
			<div class="form-row">
				<Field label="Date">
					<input type="date" {min} bind:value={date} />
				</Field>
				<Field label="Start time">
					<select bind:value={time}>
						{#each times as t (t)}<option value={t}>{fmtTime(t)}</option>{/each}
					</select>
				</Field>
			</div>
		</section>

		<section class="card form-card">
			<h2 class="form-step"><span class="step-num">3</span>Where</h2>
			<div class="loc-grid">
				{#each LOCATIONS as l (l.id)}
					<button
						type="button"
						class="loc-pick"
						class:on={locId === l.id}
						onclick={() => {
							locId = l.id;
							error = '';
						}}
					>
						<strong>{l.name}</strong>
						<span>{l.kind} · {l.area}</span>
						<span class="loc-pick-meta">{l.courts} courts · {l.surface}</span>
					</button>
				{/each}
			</div>
		</section>

		<section class="card form-card">
			<h2 class="form-step"><span class="step-num">4</span>Level</h2>
			<div class="form-row">
				<Field label="NTRP min">
					<select bind:value={lo}>
						{#each NTRP_LEVELS as l (l)}<option value={l.toFixed(1)}>{l.toFixed(1)}</option>{/each}
					</select>
				</Field>
				<Field label="NTRP max">
					<select bind:value={hi}>
						{#each NTRP_LEVELS as l (l)}<option value={l.toFixed(1)}>{l.toFixed(1)}</option>{/each}
					</select>
				</Field>
			</div>
		</section>

		<section class="card form-card">
			<h2 class="form-step"><span class="step-num">5</span>Players</h2>
			<p class="form-hint">
				You're added to this match automatically. The remaining {openIdx.length}
				{openIdx.length === 1 ? 'slot stays' : 'slots stay'} open for anyone to claim.
			</p>
			<Field label="Notes for players (optional)">
				<textarea
					rows="3"
					placeholder="Court number, what to bring, how competitive…"
					bind:value={notes}
				></textarea>
			</Field>
		</section>

		{#if error}<p class="form-error">{error}</p>{/if}
		<div class="form-actions">
			<Btn kind="ghost" href="/dashboard">Cancel</Btn>
			<Btn kind="primary" type="submit">Post match</Btn>
		</div>
	</form>
</main>

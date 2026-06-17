<script lang="ts">
	type Option = { value: string; label: string };

	let {
		options,
		value,
		onChange,
		big = false
	}: { options: Option[]; value: string; onChange: (v: string) => void; big?: boolean } = $props();
</script>

<div class="seg" class:seg-big={big} role="tablist">
	{#each options as o (o.value)}
		<button
			type="button"
			role="tab"
			aria-selected={value === o.value}
			class:on={value === o.value}
			onclick={() => onChange(o.value)}>{o.label}</button
		>
	{/each}
</div>

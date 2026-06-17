<script lang="ts">
	type Props = {
		surround?: string;
		court?: string;
		line?: string;
		lineOp?: number;
		ball?: boolean;
		class?: string;
		style?: string;
	};

	let {
		surround = '#4FB3E8',
		court = '#5FBCEB',
		line = '#fff',
		lineOp = 1,
		ball = true,
		class: className = '',
		style
	}: Props = $props();

	let op = $derived(lineOp == null ? 1 : lineOp);
</script>

<svg
	class={className}
	{style}
	viewBox="0 0 1560 960"
	preserveAspectRatio="xMidYMid slice"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<rect width="1560" height="960" fill={surround} />
	<rect x="312" y="264" width="936" height="432" fill={court} />
	<g stroke={line} stroke-width="6" fill="none" opacity={op}>
		<rect x="312" y="264" width="936" height="432" />
		<line x1="312" y1="318" x2="1248" y2="318" />
		<line x1="312" y1="642" x2="1248" y2="642" />
		<line x1="528" y1="318" x2="528" y2="642" />
		<line x1="1032" y1="318" x2="1032" y2="642" />
		<line x1="528" y1="480" x2="1032" y2="480" />
		<line x1="312" y1="480" x2="332" y2="480" />
		<line x1="1228" y1="480" x2="1248" y2="480" />
	</g>
	<g opacity={Math.min(1, op + 0.15)}>
		<line x1="780" y1="237" x2="780" y2="723" stroke={line} stroke-width="3" />
		<line
			x1="780"
			y1="240"
			x2="780"
			y2="720"
			stroke={line}
			stroke-width="11"
			stroke-dasharray="3 16"
			stroke-linecap="round"
		/>
		<circle cx="780" cy="231" r="7" fill={line} />
		<circle cx="780" cy="729" r="7" fill={line} />
	</g>
	{#if ball}
		<g>
			<circle cx="1000" cy="396" r="15" fill="var(--ball)" />
			<path d="M988 387 C 998 392, 998 400, 988 405" fill="none" stroke="#fff" stroke-width="2" />
			<path
				d="M1012 387 C 1002 392, 1002 400, 1012 405"
				fill="none"
				stroke="#fff"
				stroke-width="2"
			/>
		</g>
	{/if}
</svg>

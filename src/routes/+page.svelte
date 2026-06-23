<script lang="ts">
	import Btn from '$lib/components/Btn.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import CourtSvg from '$lib/components/CourtSvg.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let firstName = $derived(data.user?.name.split(' ')[0] ?? null);
</script>

<svelte:head>
	<title>Tennis Scheduler — never miss a match</title>
	<meta
		name="description"
		content="Post an open court, fill the empty spots, and find level-matched tennis players near you. Pickup tennis, organized — and always free to start."
	/>
</svelte:head>

<div class="hp" class:guest={!data.user}>
	{#if !data.user}
		<header class="hp-nav">
			<a class="hp-logo" href="/" aria-label="Tennis Scheduler home"><Logo light /></a>
			<nav class="hp-nav-right">
				<a class="hp-signin" href="/signin">Sign in</a>
				<Btn kind="primary" sm href="/signin?mode=signup">Get started</Btn>
			</nav>
		</header>
	{/if}

	<main class="stage">
		<CourtSvg class="stage-court" surround="#155e92" court="#2f8fc6" lineOp={0.42} ball={false} />
		<div class="stage-veil" aria-hidden="true"></div>

		<!-- decorative serve arc + floating balls -->
		<svg
			class="stage-arc"
			viewBox="0 0 1200 520"
			preserveAspectRatio="xMidYMid meet"
			aria-hidden="true"
		>
			<path d="M40 470 C 360 60, 840 60, 1160 360" />
		</svg>
		<span class="floatball fb1" aria-hidden="true"></span>
		<span class="floatball fb2" aria-hidden="true"></span>

		<div class="stage-inner">
			<span class="eyebrow">
				<span class="eyebrow-dot" aria-hidden="true"></span>
				{firstName ? 'Good to see you again' : 'Pickup tennis, organized'}
			</span>

			<h1 class="disp hl">
				{#if firstName}
					<span class="hl-line">Game on,</span>
					<span class="hl-line">
						<span class="hl-accent">{firstName}</span><span class="hl-ball" aria-hidden="true">
							<svg viewBox="0 0 24 24"
								><circle
									cx="12"
									cy="12"
									r="11"
									fill="var(--ball)"
									stroke="var(--ball-deep)"
									stroke-width="1.5"
								/><path
									d="M4 5 C 10 9, 10 15, 4 19"
									fill="none"
									stroke="#fff"
									stroke-width="1.6"
								/><path
									d="M20 5 C 14 9, 14 15, 20 19"
									fill="none"
									stroke="#fff"
									stroke-width="1.6"
								/></svg
							>
						</span>
					</span>
				{:else}
					<span class="hl-line">Never miss</span>
					<span class="hl-line">
						a <span class="hl-accent">match</span><span class="hl-ball" aria-hidden="true">
							<svg viewBox="0 0 24 24"
								><circle
									cx="12"
									cy="12"
									r="11"
									fill="var(--ball)"
									stroke="var(--ball-deep)"
									stroke-width="1.5"
								/><path
									d="M4 5 C 10 9, 10 15, 4 19"
									fill="none"
									stroke="#fff"
									stroke-width="1.6"
								/><path
									d="M20 5 C 14 9, 14 15, 20 19"
									fill="none"
									stroke="#fff"
									stroke-width="1.6"
								/></svg
							>
						</span>
					</span>
				{/if}
			</h1>

			<p class="sub">
				{#if firstName}
					Your court is waiting. Line up your next hit, claim an open spot, and get back on the
					baseline.
				{:else}
					Post an open court, fill the empty spots, and find level-matched players near you —
					singles or doubles, any time you want to play.
				{/if}
			</p>

			<div class="cta">
				{#if data.user}
					<Btn kind="primary" href="/dashboard">Go to dashboard</Btn>
					<Btn kind="white" href="/create">Schedule a match</Btn>
				{:else}
					<Btn kind="primary" href="/signin?mode=signup">Get started — it’s free</Btn>
					<Btn kind="white" href="/signin">Sign in</Btn>
				{/if}
			</div>
		</div>
	</main>
</div>

<style>
	/* Fill exactly the space the layout leaves us — own nav (guest) or TopNav (signed
	   in) sits above; flex:1 against the 100vh app-root gives a true single screen. */
	.hp {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		background: var(--blue-deep);
	}

	/* ---------- floating guest nav ---------- */
	.hp-nav {
		position: relative;
		z-index: 3;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 18px 28px;
	}
	.hp-logo {
		display: inline-flex;
		text-decoration: none;
	}
	.hp-nav-right {
		display: flex;
		align-items: center;
		gap: 18px;
	}
	.hp-signin {
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 13px;
		color: #fff;
		text-decoration: none;
		opacity: 0.92;
	}
	.hp-signin:hover {
		opacity: 1;
		text-decoration: underline;
	}

	/* ---------- the stage ---------- */
	.stage {
		position: relative;
		flex: 1;
		min-height: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 24px;
	}

	:global(.stage-court) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
	}
	.stage-veil {
		position: absolute;
		inset: 0;
		z-index: 1;
		/* darken the edges + lift legibility behind the centred type */
		background:
			radial-gradient(80% 70% at 50% 48%, rgba(8, 28, 44, 0.55) 0%, rgba(8, 28, 44, 0) 70%),
			linear-gradient(180deg, rgba(8, 28, 44, 0.5) 0%, rgba(8, 28, 44, 0) 22%),
			linear-gradient(0deg, rgba(8, 28, 44, 0.55) 0%, rgba(8, 28, 44, 0) 30%);
	}

	/* decorative serve trajectory drawn behind the headline */
	.stage-arc {
		position: absolute;
		z-index: 1;
		top: 50%;
		left: 50%;
		width: min(1180px, 116%);
		transform: translate(-50%, -58%);
		pointer-events: none;
	}
	.stage-arc path {
		fill: none;
		stroke: rgba(255, 255, 255, 0.5);
		stroke-width: 3;
		stroke-linecap: round;
		stroke-dasharray: 4 22;
	}

	.floatball {
		position: absolute;
		z-index: 1;
		border-radius: 50%;
		background: radial-gradient(
			circle at 34% 30%,
			#f4ff8a 0%,
			var(--ball) 46%,
			var(--ball-deep) 100%
		);
		box-shadow: 0 16px 40px rgba(8, 28, 44, 0.4);
		pointer-events: none;
	}
	.fb1 {
		width: 92px;
		height: 92px;
		top: 13%;
		left: 9%;
		opacity: 0.92;
	}
	.fb2 {
		width: 54px;
		height: 54px;
		bottom: 14%;
		right: 11%;
		opacity: 0.8;
	}

	/* ---------- centred content ---------- */
	.stage-inner {
		position: relative;
		z-index: 2;
		max-width: 880px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		font-size: clamp(11px, 1.4vw, 13px);
		color: var(--ball);
		margin-bottom: 22px;
	}
	.eyebrow-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--ball);
		box-shadow: 0 0 0 4px rgba(223, 242, 75, 0.22);
	}

	.hl {
		color: #fff;
		font-size: clamp(50px, 12vw, 148px);
		line-height: 0.88;
		text-shadow: 0 6px 30px rgba(8, 28, 44, 0.35);
	}
	.hl-line {
		display: block;
	}
	.hl-accent {
		color: var(--ball);
	}
	.hl-ball {
		display: inline-block;
		width: 0.6em;
		margin-left: 0.04em;
		vertical-align: -0.04em;
	}
	.hl-ball svg {
		width: 100%;
		height: auto;
		display: block;
		filter: drop-shadow(0 5px 12px rgba(8, 28, 44, 0.4));
	}

	.sub {
		margin: 26px 0 0;
		max-width: 560px;
		font-size: clamp(15px, 1.9vw, 19px);
		font-weight: 600;
		line-height: 1.45;
		color: rgba(255, 255, 255, 0.92);
	}

	.cta {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 14px;
		margin-top: 36px;
	}
	/* a touch larger than default buttons — this is the moment of the whole page */
	.cta :global(.btn) {
		padding: 16px 28px;
		font-size: 14.5px;
	}

	/* ---------- entrances (skipped when reduced motion is requested) ---------- */
	@media (prefers-reduced-motion: no-preference) {
		.eyebrow,
		.hl-line,
		.sub,
		.cta {
			opacity: 0;
			animation: rise 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		}
		.eyebrow {
			animation-delay: 0.05s;
		}
		.hl-line:nth-child(1) {
			animation-delay: 0.14s;
		}
		.hl-line:nth-child(2) {
			animation-delay: 0.24s;
		}
		.sub {
			animation-delay: 0.42s;
		}
		.cta {
			animation-delay: 0.54s;
		}

		.hl-ball {
			transform-origin: 50% 100%;
			animation: bounce 2.6s ease-in-out 1.1s infinite;
		}
		.floatball {
			animation: drift 7s ease-in-out infinite;
		}
		.fb2 {
			animation-duration: 9s;
			animation-direction: reverse;
		}

		.stage-arc path {
			stroke-dasharray: 1500;
			stroke-dashoffset: 1500;
			animation: draw 2.4s ease-out 0.3s forwards;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(26px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-0.16em);
		}
	}
	@keyframes drift {
		0%,
		100% {
			transform: translateY(0) translateX(0);
		}
		50% {
			transform: translateY(-22px) translateX(10px);
		}
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	@media (max-width: 760px) {
		.hp-nav {
			padding: 14px 18px;
		}
		/* the hero CTA already covers "get started" — keep the bar to logo + sign in */
		.hp-nav-right :global(.btn) {
			display: none;
		}
		.stage {
			padding: 20px;
		}
		.fb1 {
			width: 60px;
			height: 60px;
			top: 9%;
			left: 6%;
		}
		.fb2 {
			width: 38px;
			height: 38px;
		}
		.eyebrow {
			margin-bottom: 16px;
		}
		.sub {
			margin-top: 18px;
		}
		/* labels are long and never wrap — stack full-width instead of clipping */
		.cta {
			flex-direction: column;
			align-items: stretch;
			width: 100%;
			max-width: 330px;
			margin-top: 26px;
		}
		.cta :global(.btn) {
			width: 100%;
		}
	}
</style>

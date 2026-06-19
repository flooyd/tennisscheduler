<script lang="ts">
	import { fmtDate, fmtTime } from '$lib/data';
	import Btn from '$lib/components/Btn.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import CourtSvg from '$lib/components/CourtSvg.svelte';
	import MatchCard from '$lib/components/MatchCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let firstName = $derived(data.user?.name.split(' ')[0] ?? null);

	let mobileMenu = $state(false); // logged-out hamburger panel
	let navRoot = $state<HTMLElement>();

	const roadmap = [
		'Recurring weekly matches',
		'Calendar sync',
		'Weather-aware reminders',
		'Waitlists & auto-promote',
		'Clubs & group play',
		'Maps & directions'
	];
</script>

<svelte:head>
	<title>Tennis Scheduler — find your next match</title>
	<meta
		name="description"
		content="Post an open court, fill the empty spots, and find level-matched tennis players near you — singles or doubles, any time you want to play."
	/>
</svelte:head>

<svelte:window
	onclick={(e) => {
		if (navRoot && !navRoot.contains(e.target as Node)) mobileMenu = false;
	}}
/>

{#if !data.user}
	<header class="home-nav" bind:this={navRoot}>
		<a class="nav-logo" href="/"><Logo /></a>
		<div class="home-nav-right">
			<a class="link" href="/signin">Sign in</a>
			<Btn kind="primary" sm href="/signin?mode=signup">Get started</Btn>
		</div>

		<button
			type="button"
			class="nav-burger"
			class:open={mobileMenu}
			aria-label="Menu"
			aria-expanded={mobileMenu}
			onclick={() => (mobileMenu = !mobileMenu)}
		>
			<span></span>
			<span></span>
			<span></span>
		</button>

		{#if mobileMenu}
			<div class="nav-mobile">
				<a href="/signin">Sign in</a>
				<a class="nav-mobile-new" href="/signin?mode=signup">Get started</a>
			</div>
		{/if}
	</header>
{/if}

<main class="page home">
	<section class="hero card-blue">
		<CourtSvg class="hero-court" lineOp={0.5} ball={false} />
		<div class="hero-inner">
			<span class="hero-eyebrow">
				{firstName ? `Welcome back, ${firstName}` : 'Pickup tennis, organized'}
			</span>
			<h1 class="disp hero-title">Never miss a match.</h1>
			<p class="hero-sub">
				Post an open court, fill the empty spots, and find level-matched players near you — singles
				or doubles, any time you want to play.
			</p>
			{#if data.next}
				<p class="hero-next">
					Your next match:
					<strong>{fmtDate(data.next.date)} at {fmtTime(data.next.time)}</strong> · {data.next
						.location.name}
				</p>
			{/if}
			<div class="hero-actions">
				{#if data.user}
					<Btn kind="primary" href="/dashboard">Go to dashboard</Btn>
					<Btn kind="white" href="/create">Schedule a match</Btn>
				{:else}
					<Btn kind="primary" href="/signin?mode=signup">Get started — it’s free</Btn>
					<Btn kind="white" href="#open">See open matches</Btn>
				{/if}
			</div>
		</div>
	</section>

	<section class="stats">
		<div class="stat">
			<span class="stat-num">{data.stats.openSlots}</span>
			<span class="stat-label">Open spots to claim</span>
		</div>
		<div class="stat">
			<span class="stat-num">{data.stats.upcoming}</span>
			<span class="stat-label">Upcoming matches</span>
		</div>
		<div class="stat">
			<span class="stat-num">{data.stats.players}</span>
			<span class="stat-label">Players in the mix</span>
		</div>
		<div class="stat">
			<span class="stat-num">{data.stats.ntrpLow.toFixed(1)}–{data.stats.ntrpHigh.toFixed(1)}</span>
			<span class="stat-label">NTRP levels welcome</span>
		</div>
	</section>

	<section class="section">
		<div class="section-head">
			<h2 class="disp section-title">Everything you need to get on court</h2>
		</div>
		<div class="feature-grid">
			<div class="feature card">
				<span class="feature-ic">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<rect x="3" y="5" width="18" height="16" rx="2" />
						<line x1="3" y1="9" x2="21" y2="9" />
						<line x1="8" y1="3" x2="8" y2="6" />
						<line x1="16" y1="3" x2="16" y2="6" />
						<line x1="12" y1="13" x2="12" y2="17" />
						<line x1="10" y1="15" x2="14" y2="15" />
					</svg>
				</span>
				<h3>Post in seconds</h3>
				<p>Pick a venue, date and level, and your open court is live for players to join.</p>
			</div>
			<div class="feature card">
				<span class="feature-ic">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="9" />
						<path d="M8 12.5l2.5 2.5 5-5.5" />
					</svg>
				</span>
				<h3>Claim open spots</h3>
				<p>See a match that fits? Grab an empty slot in one tap and you’re on the roster.</p>
			</div>
			<div class="feature card">
				<span class="feature-ic">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<line x1="6" y1="20" x2="6" y2="13" />
						<line x1="12" y1="20" x2="12" y2="8" />
						<line x1="18" y1="20" x2="18" y2="4" />
					</svg>
				</span>
				<h3>Level-matched play</h3>
				<p>Every match sets an NTRP range, so you’re always paired with players your speed.</p>
			</div>
			<div class="feature card">
				<span class="feature-ic">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="8" cy="9" r="3" />
						<circle cx="16" cy="9" r="3" />
						<path d="M3 19c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" />
						<path d="M13 19c0-2.8 2.2-4.5 5-4.5s3 1 3 2.8" />
					</svg>
				</span>
				<h3>Singles &amp; doubles</h3>
				<p>Host a one-on-one or rally a foursome — the roster sizes itself to the format.</p>
			</div>
			<div class="feature card">
				<span class="feature-ic">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
						<circle cx="12" cy="10" r="2.5" />
					</svg>
				</span>
				<h3>Know the venue</h3>
				<p>Court count, surface and area are baked into every listing — no guesswork.</p>
			</div>
			<div class="feature card">
				<span class="feature-ic">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<line x1="8" y1="7" x2="20" y2="7" />
						<line x1="8" y1="12" x2="20" y2="12" />
						<line x1="8" y1="17" x2="20" y2="17" />
						<circle cx="4" cy="7" r="1.3" fill="currentColor" stroke="none" />
						<circle cx="4" cy="12" r="1.3" fill="currentColor" stroke="none" />
						<circle cx="4" cy="17" r="1.3" fill="currentColor" stroke="none" />
					</svg>
				</span>
				<h3>Stay organized</h3>
				<p>Hosting and playing matches live together, so you always know where to be next.</p>
			</div>
			<div class="feature card">
				<span class="feature-ic">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M7 4h10v3a5 5 0 0 1-10 0z" />
						<path d="M7 5H4v1a3 3 0 0 0 3 3" />
						<path d="M17 5h3v1a3 3 0 0 1-3 3" />
						<path d="M10 16h4v4h-4z" />
						<line x1="8" y1="20" x2="16" y2="20" />
					</svg>
				</span>
				<h3>Rankings ladder</h3>
				<p>Report results after you play. Wins earn points and the ladder updates automatically.</p>
			</div>
			<div class="feature card">
				<span class="feature-ic">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.2A8 8 0 1 1 21 12z" />
						<line x1="9" y1="11" x2="15" y2="11" />
						<line x1="9" y1="14.5" x2="13" y2="14.5" />
					</svg>
				</span>
				<h3>Match group chat</h3>
				<p>
					Sort out court numbers, balls and timing with the other players — right inside the match.
				</p>
			</div>
			<div class="feature card">
				<span class="feature-ic">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
						<path d="M9 12l2 2 4-4" />
					</svg>
				</span>
				<h3>Reliability score</h3>
				<p>Players who show up build a high score — so you know who you can count on for a hit.</p>
			</div>
		</div>
	</section>

	<section class="section">
		<div class="section-head">
			<h2 class="disp section-title">How it works</h2>
		</div>
		<div class="steps">
			<div class="step">
				<span class="step-num">1</span>
				<div>
					<strong>Find or post</strong>
					<p>Browse open matches near you, or post your own court in under a minute.</p>
				</div>
			</div>
			<div class="step">
				<span class="step-num">2</span>
				<div>
					<strong>Claim your spot</strong>
					<p>Tap an open slot to lock in. The host and other players see you instantly.</p>
				</div>
			</div>
			<div class="step">
				<span class="step-num">3</span>
				<div>
					<strong>Show up &amp; play</strong>
					<p>Get the venue, time and level up front — just bring your racquet.</p>
				</div>
			</div>
		</div>
	</section>

	<section class="section" id="open">
		<div class="section-head">
			<h2 class="disp section-title">
				Open matches right now
				{#if data.stats.openSlots > 0}<span class="count-pill">{data.stats.openSlots} spots</span
					>{/if}
			</h2>
			<a class="link" href={data.user ? '/search' : '/signin'}>
				{data.user ? 'Browse all' : 'Sign in to claim'}
			</a>
		</div>
		{#if data.preview.length > 0}
			<div class="match-list">
				{#each data.preview as m (m.id)}<MatchCard {m} />{/each}
			</div>
			{#if !data.user}
				<p class="mc-meta open-hint">Sign in to view full details and claim your spot.</p>
			{/if}
		{:else}
			<p class="mc-meta">
				No open matches right now —
				{#if data.user}<a class="link" href="/create">post the first one</a>.{:else}<a
						class="link"
						href="/signin">sign in to post the first one</a
					>.{/if}
			</p>
		{/if}
	</section>

	<section class="section">
		<div class="section-head">
			<h2 class="disp section-title">On the roadmap</h2>
		</div>
		<p class="roadmap-intro">Ideas we’re exploring to make pickup tennis even easier:</p>
		<div class="chips">
			{#each roadmap as r (r)}<span class="chip">{r}</span>{/each}
		</div>
	</section>

	<section class="cta card-blue">
		<CourtSvg class="hero-court" lineOp={0.4} />
		<div class="cta-inner">
			<h2 class="disp cta-title">{firstName ? `Game on, ${firstName}.` : 'Ready to hit?'}</h2>
			<p class="cta-sub">
				Join the players already filling courts this week. Posting and claiming matches is always
				free.
			</p>
			<div class="hero-actions">
				{#if data.user}
					<Btn kind="primary" href="/create">Schedule a match</Btn>
				{:else}
					<Btn kind="primary" href="/signin?mode=signup">Create your free account</Btn>
				{/if}
			</div>
		</div>
	</section>
</main>

<footer class="home-foot">
	<Logo />
	<span class="foot-tag">Pickup tennis, organized.</span>
	<nav class="foot-links">
		<a class="link" href="#open">Open matches</a>
		{#if data.user}
			<a class="link" href="/dashboard">Dashboard</a>
			<a class="link" href="/create">Schedule</a>
		{:else}
			<a class="link" href="/signin">Sign in</a>
		{/if}
	</nav>
</footer>

<style>
	.home-nav {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 0 28px;
		height: 64px;
		background: #fff;
		border-bottom: 2px solid var(--line);
	}
	.home-nav-right {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	/* Collapse into the shared hamburger (.nav-burger appears at <=860px). */
	@media (max-width: 860px) {
		.home-nav-right {
			display: none;
		}
	}

	.hero-eyebrow {
		display: inline-block;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 12px;
		color: var(--ball);
		margin-bottom: 10px;
	}
	.hero-next {
		margin: 14px 0 0;
		font-weight: 600;
		font-size: 14.5px;
		color: rgba(255, 255, 255, 0.95);
	}
	.hero-next strong {
		color: var(--ball);
		font-style: italic;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin-top: 18px;
	}
	.stat {
		background: #fff;
		border: 2px solid var(--line);
		border-radius: var(--radius);
		padding: 18px 20px;
	}
	.stat-num {
		display: block;
		font-weight: 850;
		font-style: italic;
		font-size: 30px;
		line-height: 1;
		color: var(--blue-deep);
	}
	.stat-label {
		display: block;
		margin-top: 7px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 11px;
		color: var(--ink-50);
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 12px;
	}
	.feature {
		padding: 22px 22px 20px;
	}
	.feature-ic {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: var(--blue-pale);
		color: var(--blue-deep);
		margin-bottom: 14px;
	}
	.feature-ic svg {
		width: 24px;
		height: 24px;
	}
	.feature h3 {
		font-weight: 850;
		font-style: italic;
		text-transform: uppercase;
		letter-spacing: -0.01em;
		font-size: 16px;
		margin: 0 0 6px;
	}
	.feature p {
		margin: 0;
		color: var(--ink-70);
		font-weight: 500;
		font-size: 14px;
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}
	.step {
		display: flex;
		gap: 14px;
		align-items: flex-start;
		background: #fff;
		border: 2px solid var(--line);
		border-radius: var(--radius);
		padding: 18px 20px;
	}
	.step strong {
		display: block;
		font-weight: 850;
		font-style: italic;
		text-transform: uppercase;
		font-size: 15px;
		margin-bottom: 4px;
	}
	.step p {
		margin: 0;
		color: var(--ink-70);
		font-weight: 500;
		font-size: 13.5px;
	}

	.open-hint {
		margin-top: 12px;
	}

	.roadmap-intro {
		margin: 0 0 14px;
		color: var(--ink-70);
		font-weight: 500;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chip {
		font-weight: 700;
		font-size: 12.5px;
		letter-spacing: 0.02em;
		background: #fff;
		border: 2px solid var(--line);
		color: var(--ink-70);
		border-radius: 999px;
		padding: 7px 14px;
	}

	.cta {
		margin-top: 40px;
	}
	.cta-inner {
		position: relative;
		padding: 44px 44px 40px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.cta-title {
		font-size: clamp(28px, 4vw, 44px);
		color: #fff;
	}
	.cta-sub {
		margin: 10px 0 22px;
		max-width: 520px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
	}

	.home-foot {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
		padding: 22px 28px;
		background: #fff;
		border-top: 2px solid var(--line);
	}
	.foot-tag {
		color: var(--ink-50);
		font-weight: 600;
		font-size: 13px;
	}
	.foot-links {
		margin-left: auto;
		display: flex;
		gap: 18px;
		flex-wrap: wrap;
	}

	@media (max-width: 760px) {
		.home-nav {
			padding: 0 16px;
		}
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}
		.steps {
			grid-template-columns: 1fr;
		}
		.cta-inner {
			padding: 30px 24px;
		}
	}
</style>

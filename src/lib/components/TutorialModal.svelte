<script lang="ts">
	import { showTutorial, dismissTutorial } from '$lib/stores';
	import BallDot from './BallDot.svelte';
	import Btn from './Btn.svelte';

	const steps = [
		{
			icon: '🎾',
			title: 'Welcome to the court',
			body: 'Tennis Scheduler helps you fill open courts with the right players. Host a match, or jump into one someone else posted — singles or doubles.'
		},
		{
			icon: '📅',
			title: 'Find or post a match',
			body: 'Browse open matches under “Find a match,” or hit “New match” to post your own. Pick a venue, date, time and the skill range you want.'
		},
		{
			icon: '✅',
			title: 'Claim your spot',
			body: 'Every match has slots. Tap an open slot to claim it and you’re on the roster instantly — the host and other players see you right away.'
		},
		{
			icon: '📊',
			title: 'NTRP levels',
			body: 'NTRP is a 2.0–5.5 skill rating. Matches set a range so you’re paired with players at your speed. Not sure of yours? 3.0 is a solid recreational player.'
		},
		{
			icon: '💬',
			title: 'Group chat',
			body: 'Once you’re in a match, use its group chat to sort out court numbers, who’s bringing balls, or running-late messages — without swapping phone numbers.'
		},
		{
			icon: '🏆',
			title: 'Report results & climb the ladder',
			body: 'After you play, any player can log who won. Wins earn 3 points, every match played earns 1, and the rankings ladder updates automatically.'
		},
		{
			icon: '🤝',
			title: 'Reliability score — take it seriously',
			body: 'When a result is reported, players can be marked as no-shows. Your reliability score is the share of matches you actually turned up to. Hosts can see it, so flaking out drops your score and makes it harder to get into good matches. Show up, keep it high.'
		}
	];
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && dismissTutorial()} />

{#if $showTutorial}
	<div class="tut-overlay" role="dialog" aria-modal="true" aria-label="How Tennis Scheduler works">
		<div class="tut-card">
			<header class="tut-head">
				<span class="tut-title"><BallDot size={22} /> How to play</span>
				<button type="button" class="tut-x" onclick={dismissTutorial} aria-label="Close">×</button>
			</header>

			<div class="tut-body">
				{#each steps as step, i (step.title)}
					<section class="tut-step">
						<span class="tut-ic" aria-hidden="true">{step.icon}</span>
						<div>
							<h3>{i + 1}. {step.title}</h3>
							<p>{step.body}</p>
						</div>
					</section>
				{/each}
			</div>

			<footer class="tut-foot">
				<Btn kind="primary" onclick={dismissTutorial}>Got it — let’s play</Btn>
			</footer>
		</div>
	</div>
{/if}

<style>
	.tut-overlay {
		position: fixed;
		inset: 0;
		z-index: 200;
		background: rgba(12, 34, 51, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		animation: tut-fade 0.18s ease;
	}
	.tut-card {
		background: #fff;
		border-radius: 18px;
		width: 540px;
		max-width: 100%;
		max-height: 88vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 24px 60px rgba(12, 34, 51, 0.4);
		overflow: hidden;
	}
	.tut-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px 22px;
		border-bottom: 2px solid var(--line);
	}
	.tut-title {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		font-weight: 850;
		font-style: italic;
		text-transform: uppercase;
		letter-spacing: -0.01em;
		font-size: 18px;
	}
	.tut-x {
		background: none;
		border: none;
		font-size: 26px;
		line-height: 1;
		color: var(--ink-50);
		cursor: pointer;
		padding: 0 4px;
	}
	.tut-x:hover {
		color: var(--ink);
	}
	.tut-body {
		overflow-y: auto;
		padding: 8px 22px;
	}
	.tut-step {
		display: flex;
		gap: 14px;
		align-items: flex-start;
		padding: 16px 0;
		border-bottom: 1px solid var(--line);
	}
	.tut-step:last-child {
		border-bottom: none;
	}
	.tut-ic {
		font-size: 24px;
		line-height: 1.1;
		flex: none;
		width: 40px;
		height: 40px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--blue-pale);
		border-radius: 12px;
	}
	.tut-step h3 {
		margin: 2px 0 4px;
		font-weight: 850;
		font-style: italic;
		text-transform: uppercase;
		letter-spacing: -0.01em;
		font-size: 15px;
	}
	.tut-step p {
		margin: 0;
		color: var(--ink-70);
		font-weight: 500;
		font-size: 14px;
		line-height: 1.5;
	}
	.tut-foot {
		padding: 16px 22px;
		border-top: 2px solid var(--line);
		display: flex;
		justify-content: flex-end;
	}
	@keyframes tut-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>

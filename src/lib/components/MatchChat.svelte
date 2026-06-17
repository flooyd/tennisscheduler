<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import { ping } from '$lib/stores';
	import type { ChatMessage } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import Btn from './Btn.svelte';

	let { messages, canPost }: { messages: ChatMessage[]; canPost: boolean } = $props();

	let body = $state('');
	let listEl = $state<HTMLElement>();

	function fmtTime(iso: string): string {
		return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
	}

	function toastOf(data: unknown, fallback: string): string {
		return (data as { toast?: string } | undefined)?.toast ?? fallback;
	}

	async function scrollToEnd() {
		await tick();
		if (listEl) listEl.scrollTop = listEl.scrollHeight;
	}

	// Re-scroll to the newest message whenever the count changes.
	$effect(() => {
		void messages.length;
		scrollToEnd();
	});

	// Light polling so other players' messages show up without a manual refresh.
	onMount(() => {
		if (!canPost) return;
		const t = setInterval(() => invalidate('match:detail'), 5000);
		return () => clearInterval(t);
	});
</script>

<section class="section chat">
	<h2 class="disp section-title">
		Group chat
		{#if messages.length > 0}<span class="count-pill">{messages.length}</span>{/if}
	</h2>

	<div class="chat-card card">
		<div class="chat-list" bind:this={listEl}>
			{#if messages.length === 0}
				<p class="chat-empty">No messages yet. Say hi and sort out the details.</p>
			{:else}
				{#each messages as msg (msg.id)}
					<div class="chat-msg" class:mine={msg.author.you}>
						<Avatar
							player={{
								name: msg.author.name,
								color: msg.author.color,
								image: msg.author.image,
								you: msg.author.you
							}}
							size={30}
						/>
						<div class="chat-bubble">
							<span class="chat-meta">
								<strong>{msg.author.you ? 'You' : msg.author.name}</strong>
								<span class="chat-time">{fmtTime(msg.createdAt)}</span>
							</span>
							<p class="chat-body">{msg.body}</p>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		{#if canPost}
			<form
				class="chat-form"
				method="post"
				action="?/postMessage"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							body = '';
							await invalidate('match:detail');
						} else if (result.type === 'failure') {
							ping(toastOf(result.data, 'Couldn’t send that.'));
						} else {
							await update();
						}
					};
				}}
			>
				<input
					name="body"
					placeholder="Message the other players…"
					autocomplete="off"
					maxlength="1000"
					bind:value={body}
				/>
				<Btn kind="primary" sm type="submit" disabled={body.trim().length === 0}>Send</Btn>
			</form>
		{:else}
			<p class="chat-locked">Join this match to chat with the other players.</p>
		{/if}
	</div>
</section>

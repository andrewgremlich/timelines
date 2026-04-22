<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title?: string;
		onclose?: () => void;
		children: Snippet;
	}

	let { open = $bindable(false), title, onclose, children }: Props = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialogEl) return;
		if (open && !dialogEl.open) dialogEl.showModal();
		else if (!open && dialogEl.open) dialogEl.close();
	});

	function handleClose() {
		open = false;
		onclose?.();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialogEl) handleClose();
	}
</script>

<dialog bind:this={dialogEl} onclose={handleClose} onclick={handleBackdropClick}>
	<div class="content">
		{#if title}
			<header>
				<h2>{title}</h2>
				<button type="button" class="close" aria-label="Close" onclick={handleClose}>×</button>
			</header>
		{/if}
		{@render children()}
	</div>
</dialog>

<style>
	dialog {
		border: var(--input-border);
		border-radius: 12px;
		background-color: var(--slate-900, #0f172a);
		color: var(--slate-100);
		padding: 0;
		max-width: min(90vw, 560px);
		width: 100%;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}

	.content {
		padding: 1.5rem;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	header h2 {
		margin: 0;
	}

	.close {
		background: transparent;
		border: none;
		color: var(--slate-100);
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 6px;
	}

	.close:hover {
		color: var(--rose-500);
	}

	.close:focus-visible {
		outline: 2px solid var(--rose-600);
		outline-offset: 2px;
	}
</style>

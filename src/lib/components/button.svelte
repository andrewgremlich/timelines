<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label?: string;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'normal';
		size?: 'small' | 'medium';
		disabled?: boolean;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		label,
		type = 'button',
		variant = 'normal',
		size = 'medium',
		disabled = false,
		children,
		...rest
	}: Props = $props();
</script>

<button {type} {disabled} class="{variant} {size}" {...rest}>
	{#if children}{@render children()}{:else}{label}{/if}
</button>

<style>
	button {
		border-radius: 10px;
		width: 100%;
		padding: 0.5rem;
		cursor: pointer;
		transition: background-color 0.2s;
		border: var(--input-border);
		background-color: transparent;
		color: var(--slate-100);
	}

	button.small {
		width: auto;
		padding: 0.25rem 0.75rem;
		font-size: 0.875rem;
		margin-top: 0;
		border-radius: 6px;
	}

	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
	}

	button:focus-visible {
		outline: 2px solid var(--rose-600);
		outline-offset: 2px;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button.primary {
		background-color: var(--rose-500);
		color: white;
		border: none;
	}

	button.primary:hover:not(:disabled) {
		background-color: var(--rose-600);
	}

	button.normal:hover:not(:disabled) {
		border-color: var(--rose-500);
	}
</style>

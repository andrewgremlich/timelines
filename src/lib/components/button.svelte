<script lang="ts">
	interface Props {
		label: string;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'normal';
		disabled?: boolean;
		[key: string]: unknown;
	}

	let { label, type = 'button', variant = 'normal', disabled = false, ...rest }: Props = $props();
</script>

<button {type} {disabled} class={variant} {...rest}>{label}</button>

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
		margin-top: 1rem;
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

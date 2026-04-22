<script lang="ts">
	interface Props {
		name: string;
		label?: string;
		type?: Exclude<HTMLInputElement['type'], 'submit'>;
		id?: string;
		value?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		[key: string]: unknown;
	}

	let {
		label,
		name,
		type = 'text',
		id = crypto.randomUUID(),
		value = $bindable(''),
		required = false,
		disabled = false,
		error,
		...rest
	}: Props = $props();

	const errorId = $derived(`${id}-error`);
</script>

{#if label}
	<label for={id}>
		{label}{#if required}<span aria-hidden="true"> *</span>{/if}
	</label>
{/if}
<input
	{type}
	{id}
	{name}
	{required}
	{disabled}
	bind:value
	aria-invalid={error ? 'true' : undefined}
	aria-describedby={error ? errorId : undefined}
	{...rest}
/>
{#if error}
	<span id={errorId} role="alert">{error}</span>
{/if}

<style>
	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
	}

	input {
		background-color: transparent;
		color: var(--slate-100);
		width: 100%;
		padding: 0.5rem;
		border: var(--input-border);
		border-radius: 10px;
		transition: border-color 0.2s;
		margin-bottom: 1rem;
	}

	@media (prefers-reduced-motion: reduce) {
		input {
			transition: none;
		}
	}

	input::placeholder {
		color: var(--slate-400);
	}

	input:hover {
		border-color: var(--rose-500);
	}

	input:focus-visible {
		outline: 2px solid var(--rose-600);
		outline-offset: 2px;
		border-color: var(--rose-800);
	}

	input[aria-invalid='true'] {
		border-color: var(--rose-500);
	}

	span[role='alert'] {
		display: block;
		color: var(--rose-500);
		font-size: 0.875rem;
		margin-top: 0.25rem;
	}
</style>

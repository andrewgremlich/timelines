<script lang="ts">
	import Button from './button.svelte';

	interface Props {
		page: number;
		pageCount: number;
		label?: string;
	}

	let { page = $bindable(1), pageCount, label = 'Pagination' }: Props = $props();

	let clamped = $derived(Math.min(page, pageCount));
</script>

{#if pageCount > 1}
	<nav aria-label={label}>
		<Button
			label="Prev"
			type="button"
			variant="normal"
			disabled={clamped <= 1}
			onclick={() => (page = clamped - 1)}
		/>
		<span>{clamped}/{pageCount}</span>
		<Button
			label="Next"
			type="button"
			variant="normal"
			disabled={clamped >= pageCount}
			onclick={() => (page = clamped + 1)}
		/>
	</nav>
{/if}

<style>
	nav {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-top: 1rem;
	}
</style>

<script lang="ts">
	import Input from '$lib/components/input.svelte';
	import Button from '$lib/components/button.svelte';
	import Dialog from '$lib/components/dialog.svelte';
	import Pagination from '$lib/components/pagination.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const PAGE_SIZE = 20;
	let query = $state('');
	let page = $state(1);
	let createOpen = $state(false);

	$effect(() => {
		if (form?.error) createOpen = true;
	});

	let filteredHistorians = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return data.historians;
		return data.historians.filter(
			(h) =>
				h.name.toLowerCase().includes(q) ||
				(h.nationality?.toLowerCase().includes(q) ?? false) ||
				(h.era?.toLowerCase().includes(q) ?? false)
		);
	});

	let pageCount = $derived(Math.max(1, Math.ceil(filteredHistorians.length / PAGE_SIZE)));
	let clampedPage = $derived(Math.min(page, pageCount));
	let pagedHistorians = $derived(
		filteredHistorians.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE)
	);

	$effect(() => {
		query;
		page = 1;
	});
</script>

<h2>Historians</h2>

<div class="new">
	<Button
		label="New historian"
		type="button"
		variant="primary"
		onclick={() => (createOpen = true)}
	/>
</div>

<Input name="q" bind:value={query} placeholder="Search historians..." />

<ul>
	{#each pagedHistorians as h (h.id)}
		<li>
			<a href="/admin/historians/{h.id}">{h.name}</a>
			<small>{h.era ?? ''}{h.nationality ? ` · ${h.nationality}` : ''}</small>
		</li>
	{:else}
		<li>No historians yet.</li>
	{/each}
</ul>

<Pagination bind:page {pageCount} label="Historians pagination" />

<Dialog bind:open={createOpen} title="New historian">
	<form method="POST" action="?/create">
		<Input label="Name" name="name" required />
		<Input label="Credentials" name="credentials" />
		<Input label="Nationality" name="nationality" />
		<Input label="Era" name="era" />
		<Button label="Create" type="submit" variant="primary" />
		{#if form?.error}<p role="alert">{form.error}</p>{/if}
	</form>
</Dialog>

<style>
	small {
		color: var(--slate-400);
		margin-left: 0.5rem;
	}
	.new {
		margin-bottom: 1rem;
		width: 200px;
	}
</style>

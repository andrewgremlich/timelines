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

	let filteredSources = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return data.sources;
		return data.sources.filter(
			(s) =>
				s.title.toLowerCase().includes(q) || (s.author?.toLowerCase().includes(q) ?? false)
		);
	});

	let pageCount = $derived(Math.max(1, Math.ceil(filteredSources.length / PAGE_SIZE)));
	let clampedPage = $derived(Math.min(page, pageCount));
	let pagedSources = $derived(
		filteredSources.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE)
	);

	$effect(() => {
		query;
		page = 1;
	});
</script>

<h2>Sources</h2>

<div class="new">
	<Button label="New source" type="button" variant="primary" onclick={() => (createOpen = true)} />
</div>

<Input name="q" bind:value={query} placeholder="Search sources..." />

<ul>
	{#each pagedSources as s (s.id)}
		<li>
			<a href="/admin/sources/{s.id}">{s.title}</a>
			<small>{s.source_type}{s.author ? ` · ${s.author}` : ''}</small>
		</li>
	{:else}
		<li>No sources yet.</li>
	{/each}
</ul>

<Pagination bind:page {pageCount} label="Sources pagination" />

<Dialog bind:open={createOpen} title="New source">
	<form method="POST" action="?/create">
		<Input label="Title" name="title" required />
		<Input label="Author" name="author" />
		<Input label="Publication date" name="publication_date" type="date" />
		<Input label="URL" name="url" type="url" />
		<Input label="Citation" name="citation" />
		<label for="source_type">Type</label>
		<select id="source_type" name="source_type" required>
			<option value="PRIMARY">Primary</option>
			<option value="SECONDARY">Secondary</option>
			<option value="TERTIARY">Tertiary</option>
		</select>
		<Button label="Create" type="submit" variant="primary" />
		{#if form?.error}<p role="alert">{form.error}</p>{/if}
	</form>
</Dialog>

<style>
	select {
		width: 100%;
		padding: 0.5rem;
		border: var(--input-border);
		border-radius: 10px;
		background-color: transparent;
		color: var(--slate-100);
		margin-bottom: 1rem;
	}
	small {
		color: var(--slate-400);
		margin-left: 0.5rem;
	}
	.new {
		margin-bottom: 1rem;
		width: 200px;
	}
</style>

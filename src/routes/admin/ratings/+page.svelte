<script lang="ts">
	import { page as pageStore } from '$app/state';
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

	let prefillEventId = $derived(pageStore.url.searchParams.get('event_id') ?? '');
	let prefillPersonId = $derived(pageStore.url.searchParams.get('person_id') ?? '');
	let prefillSourceId = $derived(pageStore.url.searchParams.get('source_id') ?? '');

	$effect(() => {
		if (prefillEventId || prefillPersonId || prefillSourceId) createOpen = true;
	});

	$effect(() => {
		if (form?.error) createOpen = true;
	});

	function targetLabel(r: (typeof data.ratings)[number]) {
		const parts: string[] = [];
		if (r.event_title) parts.push(`event: ${r.event_title}`);
		if (r.person_name) parts.push(`person: ${r.person_name}`);
		if (r.source_title) parts.push(`source: ${r.source_title}`);
		return parts.join(' · ');
	}

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return data.ratings;
		return data.ratings.filter(
			(r) =>
				r.historian_name.toLowerCase().includes(q) ||
				(r.source_title?.toLowerCase().includes(q) ?? false) ||
				(r.event_title?.toLowerCase().includes(q) ?? false) ||
				(r.person_name?.toLowerCase().includes(q) ?? false)
		);
	});

	let pageCount = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	let clampedPage = $derived(Math.min(page, pageCount));
	let paged = $derived(filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE));

	$effect(() => {
		query;
		page = 1;
	});
</script>

<h2>Historian ratings</h2>

<div class="new">
	<Button label="New rating" type="button" variant="primary" onclick={() => (createOpen = true)} />
</div>

<Input name="q" bind:value={query} placeholder="Search ratings..." />

<ul>
	{#each paged as r (r.id)}
		<li>
			<a href="/admin/ratings/{r.id}">{r.historian_name}</a>
			<small
				>{targetLabel(r)}{r.confidence_score !== null
					? ` · confidence ${r.confidence_score}`
					: ''}</small
			>
		</li>
	{:else}
		<li>No ratings yet.</li>
	{/each}
</ul>

<Pagination bind:page {pageCount} label="Ratings pagination" />

<Dialog bind:open={createOpen} title="New rating">
	<form method="POST" action="?/create">
		<label for="historian_id">Historian *</label>
		<select id="historian_id" name="historian_id" required>
			<option value="">— select —</option>
			{#each data.historians as h (h.id)}
				<option value={h.id}>{h.name}</option>
			{/each}
		</select>

		<p class="hint">Link to at least one:</p>

		<label for="event_id">Event</label>
		<select id="event_id" name="event_id">
			<option value="">— none —</option>
			{#each data.events as e (e.id)}
				<option value={e.id} selected={String(e.id) === prefillEventId}>{e.title}</option>
			{/each}
		</select>

		<label for="person_id">Person</label>
		<select id="person_id" name="person_id">
			<option value="">— none —</option>
			{#each data.people as p (p.id)}
				<option value={p.id} selected={String(p.id) === prefillPersonId}>{p.name}</option>
			{/each}
		</select>

		<label for="source_id">Source</label>
		<select id="source_id" name="source_id">
			<option value="">— none —</option>
			{#each data.sources as s (s.id)}
				<option value={s.id} selected={String(s.id) === prefillSourceId}>{s.title}</option>
			{/each}
		</select>

		<Input label="Context" name="context" />
		<Input label="Internal criticism" name="internal_criticism" />
		<Input label="External criticism" name="external_criticism" />
		<Input label="Bias notes" name="bias_notes" />
		<Input label="Source cardinality" name="source_cardinality" type="number" />
		<Input label="Historical distance" name="historical_distance" type="number" />
		<Input label="Corroboration" name="corroboration" type="number" />
		<Input label="Confidence score" name="confidence_score" type="number" step="0.01" />

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
	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
	}
	small {
		color: var(--slate-400);
		margin-left: 0.5rem;
	}
	.new {
		margin-bottom: 1rem;
		width: 200px;
	}
	.hint {
		color: var(--slate-400);
		margin: 0.5rem 0;
	}
</style>

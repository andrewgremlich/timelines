<script lang="ts">
	import Input from '$lib/components/input.svelte';
	import Button from '$lib/components/button.svelte';
	import Dialog from '$lib/components/dialog.svelte';
	import Pagination from '$lib/components/pagination.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	type EventFormEcho = {
		title?: string;
		description?: string | null;
		startDate?: string;
		endDate?: string | null;
		locationId?: number | null;
	};
	let f = $derived<EventFormEcho>((form ?? {}) as EventFormEcho);

	const PAGE_SIZE = 20;
	let query = $state('');
	let page = $state(1);
	let createOpen = $state(false);

	$effect(() => {
		if (form?.error) createOpen = true;
	});

	let filteredEvents = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return data.events;
		return data.events.filter(
			(e) =>
				e.title.toLowerCase().includes(q) || (e.location_name?.toLowerCase().includes(q) ?? false)
		);
	});

	let pageCount = $derived(Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE)));
	let clampedPage = $derived(Math.min(page, pageCount));
	let pagedEvents = $derived(
		filteredEvents.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE)
	);

	$effect(() => {
		query;
		page = 1;
	});
</script>

<h2>Events</h2>

<div class="new-event">
	<Button label="New event" type="button" variant="primary" onclick={() => (createOpen = true)} />
</div>

<Input name="q" bind:value={query} placeholder="Search events..." />

<ul>
	{#each pagedEvents as event (event.id)}
		<li>
			<a href="/admin/events/{event.id}">{event.title}</a>
			<small
				>({event.start_date}{event.end_date ? ` – ${event.end_date}` : ''}){event.location_name
					? ` · ${event.location_name}`
					: ''}</small
			>
		</li>
	{:else}
		<li>No events yet.</li>
	{/each}
</ul>

<Pagination bind:page {pageCount} label="Events pagination" />

<Dialog bind:open={createOpen} title="New event">
	<form method="POST" action="?/create">
		<Input label="Title" name="title" required value={f.title ?? ''} />
		<Input label="Description" name="description" value={f.description ?? ''} />
		<Input label="Start date" name="start_date" type="date" required value={f.startDate ?? ''} />
		<Input label="End date" name="end_date" type="date" value={f.endDate ?? ''} />
		<label for="location_id">Location</label>
		<select id="location_id" name="location_id">
			<option value="">— none —</option>
			{#each data.locations as loc (loc.id)}
				<option value={loc.id} selected={f.locationId === loc.id}>{loc.name}</option>
			{/each}
		</select>
		<Button label="Create" type="submit" variant="primary" />
		{#if form?.error}
			<p role="alert">{form.error}</p>
		{/if}
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

	.new-event {
		margin-bottom: 1rem;
		width: 200px;
	}
</style>

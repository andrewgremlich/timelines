<script lang="ts">
	import Input from '$lib/components/input.svelte';
	import Button from '$lib/components/button.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h2>Edit event</h2>

<form method="POST" action="?/update">
	<Input label="Title" name="title" required value={data.event.title} />
	<Input label="Description" name="description" value={data.event.description ?? ''} />
	<Input label="Start date" name="start_date" type="date" required value={data.event.start_date} />
	<Input label="End date" name="end_date" type="date" value={data.event.end_date ?? ''} />
	<label for="location_id">Location</label>
	<select id="location_id" name="location_id">
		<option value="">— none —</option>
		{#each data.locations as loc (loc.id)}
			<option value={loc.id} selected={data.event.location_id === loc.id}>{loc.name}</option>
		{/each}
	</select>
	<Button label="Save" type="submit" variant="primary" />
	{#if form?.saved}
		<p role="status">Saved.</p>
	{/if}
	{#if form?.error}
		<p role="alert">{form.error}</p>
	{/if}
</form>

<form method="POST" action="?/delete" onsubmit={(e) => { if (!confirm('Delete this event?')) e.preventDefault(); }}>
	<Button label="Delete" type="submit" />
</form>

<p><a href="/admin/events">← Back to events</a></p>

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
</style>

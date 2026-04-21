<script lang="ts">
	import Input from '$lib/components/input.svelte';
	import Button from '$lib/components/button.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h2>Edit source</h2>

<form method="POST" action="?/update">
	<Input label="Title" name="title" required value={data.source.title} />
	<Input label="Author" name="author" value={data.source.author ?? ''} />
	<Input label="Publication date" name="publication_date" type="date" value={data.source.publication_date ?? ''} />
	<Input label="URL" name="url" type="url" value={data.source.url ?? ''} />
	<Input label="Citation" name="citation" value={data.source.citation ?? ''} />
	<label for="source_type">Type</label>
	<select id="source_type" name="source_type" required>
		<option value="PRIMARY" selected={data.source.source_type === 'PRIMARY'}>Primary</option>
		<option value="SECONDARY" selected={data.source.source_type === 'SECONDARY'}>Secondary</option>
		<option value="TERTIARY" selected={data.source.source_type === 'TERTIARY'}>Tertiary</option>
	</select>
	<Button label="Save" type="submit" variant="primary" />
	{#if form?.saved}<p role="status">Saved.</p>{/if}
	{#if form?.error}<p role="alert">{form.error}</p>{/if}
</form>

<form method="POST" action="?/delete" onsubmit={(e) => { if (!confirm('Delete this source?')) e.preventDefault(); }}>
	<Button label="Delete" type="submit" />
</form>

<p><a href="/admin/sources">← Back to sources</a></p>

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

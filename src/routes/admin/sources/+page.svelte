<script lang="ts">
	import Input from '$lib/components/input.svelte';
	import Button from '$lib/components/button.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h2>Sources</h2>

<ul>
	{#each data.sources as s (s.id)}
		<li>
			<a href="/admin/sources/{s.id}">{s.title}</a>
			<small>{s.source_type}{s.author ? ` · ${s.author}` : ''}</small>
		</li>
	{:else}
		<li>No sources yet.</li>
	{/each}
</ul>

<h3>New source</h3>
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
</style>

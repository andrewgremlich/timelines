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

	let filteredPeople = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return data.people;
		return data.people.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				(p.nationality?.toLowerCase().includes(q) ?? false)
		);
	});

	let pageCount = $derived(Math.max(1, Math.ceil(filteredPeople.length / PAGE_SIZE)));
	let clampedPage = $derived(Math.min(page, pageCount));
	let pagedPeople = $derived(
		filteredPeople.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE)
	);

	$effect(() => {
		query;
		page = 1;
	});
</script>

<h2>People</h2>

<div class="new">
	<Button label="New person" type="button" variant="primary" onclick={() => (createOpen = true)} />
</div>

<Input name="q" bind:value={query} placeholder="Search people..." />

<ul>
	{#each pagedPeople as p (p.id)}
		<li>
			<a href="/admin/people/{p.id}">{p.name}</a>
			<small
				>{p.birth_date ?? '?'} – {p.death_date ?? '?'}{p.nationality
					? ` · ${p.nationality}`
					: ''}</small
			>
		</li>
	{:else}
		<li>No people yet.</li>
	{/each}
</ul>

<Pagination bind:page {pageCount} label="People pagination" />

<Dialog bind:open={createOpen} title="New person">
	<form method="POST" action="?/create">
		<Input label="Name" name="name" required />
		<Input label="Birth date" name="birth_date" type="date" />
		<Input label="Death date" name="death_date" type="date" />
		<Input label="Nationality" name="nationality" />
		<Input label="Occupation" name="occupation" />
		<Input label="Biography" name="biography" />
		<Button label="Create" type="submit" variant="primary" />
		{#if form?.error}
			<p role="alert">{form.error}</p>
		{/if}
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

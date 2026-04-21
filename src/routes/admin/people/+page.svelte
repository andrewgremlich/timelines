<script lang="ts">
	import Input from '$lib/components/input.svelte';
	import Button from '$lib/components/button.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h2>People</h2>

<ul>
	{#each data.people as p (p.id)}
		<li>
			<a href="/admin/people/{p.id}">{p.name}</a>
			<small>{p.birth_date ?? '?'} – {p.death_date ?? '?'}{p.nationality ? ` · ${p.nationality}` : ''}</small>
		</li>
	{:else}
		<li>No people yet.</li>
	{/each}
</ul>

<h3>New person</h3>
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

<style>
	small {
		color: var(--slate-400);
		margin-left: 0.5rem;
	}
</style>

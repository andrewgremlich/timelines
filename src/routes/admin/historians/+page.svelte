<script lang="ts">
	import Input from '$lib/components/input.svelte';
	import Button from '$lib/components/button.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h2>Historians</h2>

<ul>
	{#each data.historians as h (h.id)}
		<li>
			<a href="/admin/historians/{h.id}">{h.name}</a>
			<small>{h.era ?? ''}{h.nationality ? ` · ${h.nationality}` : ''}</small>
		</li>
	{:else}
		<li>No historians yet.</li>
	{/each}
</ul>

<h3>New historian</h3>
<form method="POST" action="?/create">
	<Input label="Name" name="name" required />
	<Input label="Credentials" name="credentials" />
	<Input label="Nationality" name="nationality" />
	<Input label="Era" name="era" />
	<Button label="Create" type="submit" variant="primary" />
	{#if form?.error}<p role="alert">{form.error}</p>{/if}
</form>

<style>
	small {
		color: var(--slate-400);
		margin-left: 0.5rem;
	}
</style>

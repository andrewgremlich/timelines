<script lang="ts">
	import Input from '$lib/components/input.svelte';
	import Button from '$lib/components/button.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h2>Edit person</h2>

<form method="POST" action="?/update">
	<Input label="Name" name="name" required value={data.person.name} />
	<Input label="Birth date" name="birth_date" type="date" value={data.person.birth_date ?? ''} />
	<Input label="Death date" name="death_date" type="date" value={data.person.death_date ?? ''} />
	<Input label="Nationality" name="nationality" value={data.person.nationality ?? ''} />
	<Input label="Occupation" name="occupation" value={data.person.occupation ?? ''} />
	<Input label="Biography" name="biography" value={data.person.biography ?? ''} />
	<Button label="Save" type="submit" variant="primary" />
	{#if form?.saved}<p role="status">Saved.</p>{/if}
	{#if form?.error}<p role="alert">{form.error}</p>{/if}
</form>

<form method="POST" action="?/delete" onsubmit={(e) => { if (!confirm('Delete this person?')) e.preventDefault(); }}>
	<Button label="Delete" type="submit" />
</form>

<p><a href="/admin/people">← Back to people</a></p>

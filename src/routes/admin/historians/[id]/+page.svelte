<script lang="ts">
	import Input from '$lib/components/input.svelte';
	import Button from '$lib/components/button.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h2>Edit historian</h2>

<form method="POST" action="?/update">
	<Input label="Name" name="name" required value={data.historian.name} />
	<Input label="Credentials" name="credentials" value={data.historian.credentials ?? ''} />
	<Input label="Nationality" name="nationality" value={data.historian.nationality ?? ''} />
	<Input label="Era" name="era" value={data.historian.era ?? ''} />
	<Button label="Save" type="submit" variant="primary" />
	{#if form?.saved}<p role="status">Saved.</p>{/if}
	{#if form?.error}<p role="alert">{form.error}</p>{/if}
</form>

<form method="POST" action="?/delete" onsubmit={(e) => { if (!confirm('Delete this historian?')) e.preventDefault(); }}>
	<Button label="Delete" type="submit" />
</form>

<p><a href="/admin/historians">← Back to historians</a></p>

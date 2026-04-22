<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let r = $derived(data.rating);
</script>

<h2>Rating by {r.historian_name}</h2>

<dl>
	{#if r.event_id}
		<dt>Event</dt>
		<dd><a href="/admin/events/{r.event_id}">{r.event_title}</a></dd>
	{/if}
	{#if r.person_id}
		<dt>Person</dt>
		<dd><a href="/admin/people/{r.person_id}">{r.person_name}</a></dd>
	{/if}
	{#if r.source_id}
		<dt>Source</dt>
		<dd><a href="/admin/sources/{r.source_id}">{r.source_title}</a></dd>
	{/if}
	<dt>Rated</dt>
	<dd>{r.rating_date}</dd>
	{#if r.confidence_score !== null}
		<dt>Confidence score</dt>
		<dd>{r.confidence_score}</dd>
	{/if}
	{#if r.source_cardinality !== null}
		<dt>Source cardinality</dt>
		<dd>{r.source_cardinality}</dd>
	{/if}
	{#if r.historical_distance !== null}
		<dt>Historical distance</dt>
		<dd>{r.historical_distance}</dd>
	{/if}
	{#if r.corroboration !== null}
		<dt>Corroboration</dt>
		<dd>{r.corroboration}</dd>
	{/if}
	{#if r.context}
		<dt>Context</dt>
		<dd>{r.context}</dd>
	{/if}
	{#if r.internal_criticism}
		<dt>Internal criticism</dt>
		<dd>{r.internal_criticism}</dd>
	{/if}
	{#if r.external_criticism}
		<dt>External criticism</dt>
		<dd>{r.external_criticism}</dd>
	{/if}
	{#if r.bias_notes}
		<dt>Bias notes</dt>
		<dd>{r.bias_notes}</dd>
	{/if}
</dl>

<form
	method="POST"
	action="?/delete"
	onsubmit={(e) => {
		if (!confirm('Delete this rating?')) e.preventDefault();
	}}
>
	<Button label="Delete" type="submit" />
</form>

<p><a href="/admin/ratings">← Back to ratings</a></p>

<style>
	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.5rem 1rem;
		margin-bottom: 1.5rem;
	}
	dt {
		font-weight: bold;
		color: var(--slate-400);
	}
	dd {
		margin: 0;
	}
</style>

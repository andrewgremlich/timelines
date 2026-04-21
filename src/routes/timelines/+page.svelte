<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { PageProps } from './$types';
	import type { EventPayload, Person } from '$lib/server/timelines';

	let { data }: PageProps = $props();

	type FullPayload = EventPayload & { activePerson: Person };

	// svelte-ignore state_referenced_locally
	const initial: FullPayload = { ...data };
	let activePerson = $state<Person>(initial.activePerson);
	let eventsById = $state<Map<number, FullPayload>>(new Map([[initial.event.id, initial]]));
	let eventOrder = $state<number[]>(
		[initial.prevEventId, initial.event.id, initial.nextEventId].filter(
			(v): v is number => v !== null
		)
	);
	let currentEventId = $state<number>(initial.event.id);
	let liveMessage = $state<string>('');

	let pageTitle = $derived(`${activePerson.name}’s Timeline`);
	let currentPayload = $derived<FullPayload | undefined>(eventsById.get(currentEventId));

	let yScroller = $state<HTMLElement | null>(null);
	const inflight = new Set<number>();
	let observer: IntersectionObserver | null = null;
	let urlSyncTimer: ReturnType<typeof setTimeout> | null = null;

	function syncUrl() {
		if (urlSyncTimer) clearTimeout(urlSyncTimer);
		urlSyncTimer = setTimeout(() => {
			const url = new URL(location.href);
			url.searchParams.set('person', String(activePerson.id));
			url.searchParams.set('event', String(currentEventId));
			history.replaceState(history.state, '', url);
		}, 150);
	}

	async function fetchPayload(personId: number, eventId: number): Promise<FullPayload | null> {
		if (inflight.has(eventId)) return null;
		inflight.add(eventId);
		try {
			const res = await fetch(
				`/api/timelines/event?person=${personId}&event=${eventId}`,
				{ headers: { accept: 'application/json' } }
			);
			if (!res.ok) return null;
			return (await res.json()) as FullPayload;
		} catch {
			return null;
		} finally {
			inflight.delete(eventId);
		}
	}

	async function ensureAdjacentLoaded(eventId: number) {
		const payload = eventsById.get(eventId);
		if (!payload) return;
		const neighbors: Array<{ id: number; where: 'prev' | 'next' }> = [];
		if (payload.prevEventId && !eventsById.has(payload.prevEventId)) {
			neighbors.push({ id: payload.prevEventId, where: 'prev' });
		}
		if (payload.nextEventId && !eventsById.has(payload.nextEventId)) {
			neighbors.push({ id: payload.nextEventId, where: 'next' });
		}
		for (const n of neighbors) {
			const fetched = await fetchPayload(activePerson.id, n.id);
			if (!fetched) continue;
			if (eventsById.has(n.id)) continue;
			await spliceRow(n.where, n.id, fetched);
		}
	}

	async function spliceRow(where: 'prev' | 'next', eventId: number, payload: FullPayload) {
		const next = new Map(eventsById);
		next.set(eventId, payload);
		eventsById = next;

		const currentIndex = eventOrder.indexOf(currentEventId);
		if (currentIndex < 0) return;

		const anchor = yScroller;
		const prevScrollHeight = anchor?.scrollHeight ?? 0;
		const prevScrollTop = anchor?.scrollTop ?? 0;

		if (where === 'prev') {
			eventOrder = [eventId, ...eventOrder.filter((id) => id !== eventId)];
		} else {
			const order = eventOrder.filter((id) => id !== eventId);
			order.splice(currentIndex + 1, 0, eventId);
			eventOrder = order;
		}

		if (where === 'prev' && anchor) {
			await tick();
			const delta = anchor.scrollHeight - prevScrollHeight;
			if (delta > 0) anchor.scrollTop = prevScrollTop + delta;
		}
	}

	function handleIntersect(entries: IntersectionObserverEntry[]) {
		let best: IntersectionObserverEntry | null = null;
		for (const e of entries) {
			if (!e.isIntersecting) continue;
			if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
		}
		if (!best) return;
		const eid = Number((best.target as HTMLElement).dataset.eventId);
		if (!Number.isInteger(eid) || eid === currentEventId) return;
		currentEventId = eid;
		const title = eventsById.get(eid)?.event.title;
		if (title) liveMessage = `Now viewing: ${title}`;
		syncUrl();
		ensureAdjacentLoaded(eid);
	}

	function attachObserver() {
		if (observer) observer.disconnect();
		if (!yScroller) return;
		observer = new IntersectionObserver(handleIntersect, {
			root: yScroller,
			threshold: [0.6]
		});
		for (const row of yScroller.querySelectorAll<HTMLElement>('.event-row')) {
			observer.observe(row);
		}
	}

	async function selectPerson(newPersonId: number) {
		if (newPersonId === activePerson.id) return;
		const fetched = await fetchPayload(newPersonId, currentEventId);
		if (!fetched) return;
		activePerson = fetched.activePerson;
		const fresh = new Map<number, FullPayload>([[fetched.event.id, fetched]]);
		eventsById = fresh;
		eventOrder = [fetched.prevEventId, fetched.event.id, fetched.nextEventId].filter(
			(v): v is number => v !== null
		);
		currentEventId = fetched.event.id;
		liveMessage = `Now viewing ${activePerson.name}'s timeline at ${fetched.event.title}`;
		syncUrl();
		await tick();
		attachObserver();
		const target = yScroller?.querySelector<HTMLElement>(
			`.event-row[data-event-id="${currentEventId}"]`
		);
		target?.scrollIntoView({ block: 'start', behavior: 'auto' });
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!yScroller) return;
		const rows = Array.from(yScroller.querySelectorAll<HTMLElement>('.event-row'));
		const currentIndex = rows.findIndex((r) => Number(r.dataset.eventId) === currentEventId);
		if (event.key === 'ArrowDown' || event.key === 'PageDown') {
			const next = rows[currentIndex + 1];
			if (next) {
				event.preventDefault();
				next.scrollIntoView({ block: 'start', behavior: 'smooth' });
			}
		} else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
			const prev = rows[currentIndex - 1];
			if (prev) {
				event.preventDefault();
				prev.scrollIntoView({ block: 'start', behavior: 'smooth' });
			}
		}
	}

	function formatYear(value: string | null): string {
		if (!value) return '';
		if (value.startsWith('-')) {
			return `${Number(value.slice(1))} BC`;
		}
		return `AD ${Number(value)}`;
	}

	function formatDateRange(start: string, end: string | null): string {
		if (!end || end === start) return formatYear(start);
		return `c. ${formatYear(start)} – ${formatYear(end)}`;
	}

	onMount(() => {
		attachObserver();
		ensureAdjacentLoaded(currentEventId);
		return () => {
			observer?.disconnect();
			if (urlSyncTimer) clearTimeout(urlSyncTimer);
		};
	});

	$effect(() => {
		// Re-attach when eventOrder changes shape.
		void eventOrder;
		queueMicrotask(attachObserver);
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<h1 class="sr-only">{pageTitle}</h1>
<div class="sr-only" aria-live="polite" aria-atomic="true">{liveMessage}</div>

<header class="timeline-header">
	<p class="eyebrow">Timeline of</p>
	<p class="person-name">{activePerson.name}</p>
	{#if activePerson.birth_date || activePerson.death_date}
		<p class="person-dates">
			{activePerson.birth_date ? formatYear(activePerson.birth_date) : '?'}
			–
			{activePerson.death_date ? formatYear(activePerson.death_date) : '?'}
		</p>
	{/if}
</header>

<section class="y-snap" bind:this={yScroller} aria-label="Events in chronological order">
	{#each eventOrder as eid (eid + ':' + activePerson.id)}
		{@const payload = eventsById.get(eid)}
		{#if payload}
			<article
				class="event-row"
				data-event-id={eid}
				aria-labelledby="event-{eid}-title"
			>
				<div class="event-meta">
					<h2 id="event-{eid}-title">{payload.event.title}</h2>
					<p class="event-date">
						{formatDateRange(payload.event.start_date, payload.event.end_date)}
						{#if payload.event.location}
							· {payload.event.location.name}{payload.event.location.region
								? `, ${payload.event.location.region}`
								: ''}
						{/if}
					</p>
					{#if payload.event.description}
						<p class="event-description">{payload.event.description}</p>
					{/if}
				</div>

				{#if payload.linkedPeople.length > 1}
					<div class="x-snap" aria-label="People involved in this event">
						{#each payload.linkedPeople as p (p.id)}
							<button
								type="button"
								class="person-card"
								class:active={p.id === activePerson.id}
								onclick={() => selectPerson(p.id)}
								aria-pressed={p.id === activePerson.id}
							>
								<span class="person-card-name">{p.name}</span>
								{#if p.role}<span class="person-card-role">{p.role}</span>{/if}
							</button>
						{/each}
					</div>
				{:else if payload.linkedPeople.length === 1}
					<div class="person-card-single">
						<span class="person-card-name active">{payload.linkedPeople[0].name}</span>
						{#if payload.linkedPeople[0].role}
							<span class="person-card-role">{payload.linkedPeople[0].role}</span>
						{/if}
					</div>
				{/if}

				{#if payload.sources.length}
					<aside class="sources" aria-label="Sources">
						<h3>Sources</h3>
						<ul>
							{#each payload.sources as s (s.id)}
								<li>
									<span class="source-type">{s.source_type}</span>
									{#if s.citation}
										<span>{s.citation}</span>
									{:else}
										<span>{s.title}{s.author ? ` — ${s.author}` : ''}</span>
									{/if}
									{#if s.url}
										<a href={s.url} target="_blank" rel="noopener noreferrer">link</a>
									{/if}
								</li>
							{/each}
						</ul>
					</aside>
				{/if}
			</article>
		{/if}
	{/each}
</section>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.timeline-header {
		padding: 1rem;
		border-bottom: 1px solid var(--slate-400);
	}

	.eyebrow {
		font-size: 0.75rem;
		color: var(--slate-400);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin: 0;
	}

	.person-name {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
	}

	.person-dates {
		font-size: 0.875rem;
		color: var(--slate-400);
		margin: 0;
	}

	.y-snap {
		height: calc(100dvh - 10rem);
		overflow-y: auto;
		scroll-snap-type: y mandatory;
		overscroll-behavior-y: contain;
		touch-action: pan-y;
	}

	.event-row {
		min-height: calc(100dvh - 10rem);
		scroll-snap-align: start;
		scroll-snap-stop: always;
		display: grid;
		grid-template-rows: auto auto auto;
		gap: 1rem;
		padding: 1.5rem 1rem;
		border-bottom: 1px solid var(--slate-400);
	}

	.event-meta h2 {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
	}

	.event-date {
		color: var(--slate-400);
		margin: 0 0 0.5rem;
		font-size: 0.875rem;
	}

	.event-description {
		margin: 0;
		line-height: 1.6;
	}

	.x-snap {
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		overscroll-behavior-x: contain;
		touch-action: pan-x;
		padding: 0.5rem 0;
	}

	.person-card {
		flex: 0 0 calc(100% - 1rem);
		scroll-snap-align: center;
		scroll-snap-stop: always;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
		padding: 1rem;
		border: var(--input-border);
		border-radius: 10px;
		background: transparent;
		color: var(--slate-100);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.person-card.active {
		border-color: var(--rose-500);
		outline: 2px solid var(--rose-500);
	}

	.person-card-single {
		padding: 1rem;
		border: var(--input-border);
		border-radius: 10px;
	}

	.person-card-name {
		font-weight: 500;
	}

	.person-card-name.active,
	.person-card.active .person-card-name {
		font-weight: 700;
	}

	.person-card-role {
		font-size: 0.875rem;
		color: var(--slate-400);
	}

	.sources {
		font-size: 0.875rem;
	}

	.sources h3 {
		margin: 0 0 0.5rem;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--slate-400);
	}

	.sources ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.5rem;
	}

	.source-type {
		display: inline-block;
		font-size: 0.7rem;
		padding: 0.1rem 0.4rem;
		border: 1px solid var(--slate-400);
		border-radius: 4px;
		margin-right: 0.5rem;
		color: var(--slate-400);
	}

	@media (min-width: 768px) {
		.person-card {
			flex: 0 0 calc(50% - 0.5rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.y-snap,
		.x-snap {
			scroll-snap-type: none;
			scroll-behavior: auto;
		}
	}
</style>

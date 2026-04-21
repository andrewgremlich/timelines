export type Person = {
	id: number;
	name: string;
	birth_date: string | null;
	death_date: string | null;
	nationality: string | null;
	occupation: string | null;
	biography: string | null;
};

export type LinkedPerson = { id: number; name: string; role: string | null };

export type SourceCitation = {
	id: number;
	title: string;
	author: string | null;
	publication_date: string | null;
	url: string | null;
	citation: string | null;
	source_type: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
};

export type EventFull = {
	id: number;
	title: string;
	description: string | null;
	start_date: string;
	end_date: string | null;
	location: { name: string; historical_name: string | null; region: string | null; country: string | null } | null;
};

export type EventPayload = {
	event: EventFull;
	linkedPeople: LinkedPerson[];
	sources: SourceCitation[];
	prevEventId: number | null;
	nextEventId: number | null;
};

export async function pickRandomActive(
	db: D1Database
): Promise<{ personId: number; eventId: number } | null> {
	const row = await db
		.prepare('SELECT person_id, event_id FROM person_to_event ORDER BY RANDOM() LIMIT 1')
		.first<{ person_id: number; event_id: number }>();
	return row ? { personId: row.person_id, eventId: row.event_id } : null;
}

export async function pickRandomPersonForEvent(
	db: D1Database,
	eventId: number
): Promise<number | null> {
	const row = await db
		.prepare('SELECT person_id FROM person_to_event WHERE event_id = ? ORDER BY RANDOM() LIMIT 1')
		.bind(eventId)
		.first<{ person_id: number }>();
	return row?.person_id ?? null;
}

export async function loadPerson(db: D1Database, personId: number): Promise<Person | null> {
	return await db
		.prepare(
			'SELECT id, name, birth_date, death_date, nationality, occupation, biography FROM person WHERE id = ?'
		)
		.bind(personId)
		.first<Person>();
}

export async function isPersonLinkedToEvent(
	db: D1Database,
	personId: number,
	eventId: number
): Promise<boolean> {
	const row = await db
		.prepare('SELECT 1 AS x FROM person_to_event WHERE person_id = ? AND event_id = ? LIMIT 1')
		.bind(personId, eventId)
		.first<{ x: number }>();
	return !!row;
}

export async function loadEventPayload(
	db: D1Database,
	personId: number,
	eventId: number
): Promise<EventPayload | null> {
	type EventRow = {
		id: number;
		title: string;
		description: string | null;
		start_date: string;
		end_date: string | null;
		loc_name: string | null;
		loc_hist: string | null;
		loc_region: string | null;
		loc_country: string | null;
	};

	const [eventRow, linkedPeople, sources] = await Promise.all([
		db
			.prepare(
				`SELECT e.id, e.title, e.description, e.start_date, e.end_date,
				        l.name AS loc_name, l.historical_name AS loc_hist,
				        l.region AS loc_region, l.country AS loc_country
				 FROM event e LEFT JOIN location l ON l.id = e.location_id
				 WHERE e.id = ?`
			)
			.bind(eventId)
			.first<EventRow>(),
		db
			.prepare(
				`SELECT p.id, p.name, pte.role
				 FROM person_to_event pte JOIN person p ON p.id = pte.person_id
				 WHERE pte.event_id = ?
				 ORDER BY p.name`
			)
			.bind(eventId)
			.all<LinkedPerson>(),
		db
			.prepare(
				`SELECT s.id, s.title, s.author, s.publication_date, s.url, s.citation, s.source_type
				 FROM source_to_event ste JOIN source s ON s.id = ste.source_id
				 WHERE ste.event_id = ?
				 ORDER BY s.publication_date`
			)
			.bind(eventId)
			.all<SourceCitation>()
	]);

	if (!eventRow) return null;

	const { prevEventId, nextEventId } = await getPrevNextForPerson(
		db,
		personId,
		eventRow.start_date,
		eventId
	);

	const event: EventFull = {
		id: eventRow.id,
		title: eventRow.title,
		description: eventRow.description,
		start_date: eventRow.start_date,
		end_date: eventRow.end_date,
		location: eventRow.loc_name
			? {
					name: eventRow.loc_name,
					historical_name: eventRow.loc_hist,
					region: eventRow.loc_region,
					country: eventRow.loc_country
				}
			: null
	};

	return {
		event,
		linkedPeople: linkedPeople.results,
		sources: sources.results,
		prevEventId,
		nextEventId
	};
}

export async function getPrevNextForPerson(
	db: D1Database,
	personId: number,
	startDate: string,
	eventId: number
): Promise<{ prevEventId: number | null; nextEventId: number | null }> {
	const [prev, next] = await Promise.all([
		db
			.prepare(
				`SELECT e.id FROM event e
				 JOIN person_to_event pte ON pte.event_id = e.id
				 WHERE pte.person_id = ?
				   AND (e.start_date < ? OR (e.start_date = ? AND e.id < ?))
				 ORDER BY e.start_date DESC, e.id DESC LIMIT 1`
			)
			.bind(personId, startDate, startDate, eventId)
			.first<{ id: number }>(),
		db
			.prepare(
				`SELECT e.id FROM event e
				 JOIN person_to_event pte ON pte.event_id = e.id
				 WHERE pte.person_id = ?
				   AND (e.start_date > ? OR (e.start_date = ? AND e.id > ?))
				 ORDER BY e.start_date ASC, e.id ASC LIMIT 1`
			)
			.bind(personId, startDate, startDate, eventId)
			.first<{ id: number }>()
	]);
	return { prevEventId: prev?.id ?? null, nextEventId: next?.id ?? null };
}

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { ratings: [], historians: [], events: [], people: [], sources: [] };
	}
	const db = platform.env.DB;

	const [ratings, historians, events, people, sources] = await Promise.all([
		db
			.prepare(
				`SELECT r.id, r.confidence_score, r.rating_date,
				        h.name AS historian_name,
				        s.title AS source_title,
				        e.title AS event_title,
				        p.name  AS person_name
				 FROM historian_rating r
				 JOIN historian h ON h.id = r.historian_id
				 LEFT JOIN source s ON s.id = r.source_id
				 LEFT JOIN event  e ON e.id = r.event_id
				 LEFT JOIN person p ON p.id = r.person_id
				 ORDER BY r.rating_date DESC`
			)
			.all<{
				id: number;
				confidence_score: number | null;
				rating_date: string;
				historian_name: string;
				source_title: string | null;
				event_title: string | null;
				person_name: string | null;
			}>(),
		db.prepare('SELECT id, name FROM historian ORDER BY name').all<{ id: number; name: string }>(),
		db.prepare('SELECT id, title FROM event ORDER BY title').all<{ id: number; title: string }>(),
		db.prepare('SELECT id, name FROM person ORDER BY name').all<{ id: number; name: string }>(),
		db.prepare('SELECT id, title FROM source ORDER BY title').all<{ id: number; title: string }>()
	]);

	return {
		ratings: ratings.results,
		historians: historians.results,
		events: events.results,
		people: people.results,
		sources: sources.results
	};
};

export const actions: Actions = {
	create: async ({ request, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		const form = await request.formData();
		const historianId = Number(form.get('historian_id') ?? 0);
		if (!Number.isInteger(historianId) || historianId <= 0) {
			return fail(400, { error: 'Historian is required.' });
		}

		const parseId = (name: string) => {
			const raw = String(form.get(name) ?? '').trim();
			return raw ? Number(raw) : null;
		};
		const sourceId = parseId('source_id');
		const eventId = parseId('event_id');
		const personId = parseId('person_id');
		if (!sourceId && !eventId && !personId) {
			return fail(400, { error: 'Link at least one of source, event, or person.' });
		}

		const parseIntField = (name: string) => {
			const raw = String(form.get(name) ?? '').trim();
			return raw ? Number(raw) : null;
		};
		const parseFloatField = (name: string) => {
			const raw = String(form.get(name) ?? '').trim();
			return raw ? Number(raw) : null;
		};
		const parseTextField = (name: string) =>
			String(form.get(name) ?? '').trim() || null;

		const result = await platform.env.DB
			.prepare(
				`INSERT INTO historian_rating (
					historian_id, source_id, event_id, person_id,
					source_cardinality, historical_distance, context, corroboration,
					internal_criticism, external_criticism, bias_notes, confidence_score
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				historianId,
				sourceId,
				eventId,
				personId,
				parseIntField('source_cardinality'),
				parseIntField('historical_distance'),
				parseTextField('context'),
				parseIntField('corroboration'),
				parseTextField('internal_criticism'),
				parseTextField('external_criticism'),
				parseTextField('bias_notes'),
				parseFloatField('confidence_score')
			)
			.run();

		throw redirect(303, `/admin/ratings/${result.meta.last_row_id}`);
	}
};

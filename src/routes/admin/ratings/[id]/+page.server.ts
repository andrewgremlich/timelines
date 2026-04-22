import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) throw error(503, 'Service unavailable');
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Invalid id');

	const db = platform.env.DB;
	const rating = await db
		.prepare(
			`SELECT r.*,
			        h.name AS historian_name,
			        s.title AS source_title,
			        e.title AS event_title,
			        p.name  AS person_name
			 FROM historian_rating r
			 JOIN historian h ON h.id = r.historian_id
			 LEFT JOIN source s ON s.id = r.source_id
			 LEFT JOIN event  e ON e.id = r.event_id
			 LEFT JOIN person p ON p.id = r.person_id
			 WHERE r.id = ?`
		)
		.bind(id)
		.first<{
			id: number;
			historian_id: number;
			source_id: number | null;
			event_id: number | null;
			person_id: number | null;
			source_cardinality: number | null;
			historical_distance: number | null;
			context: string | null;
			corroboration: number | null;
			internal_criticism: string | null;
			external_criticism: string | null;
			bias_notes: string | null;
			confidence_score: number | null;
			rating_date: string;
			historian_name: string;
			source_title: string | null;
			event_title: string | null;
			person_name: string | null;
		}>();

	if (!rating) throw error(404, 'Not found');
	return { rating };
};

export const actions: Actions = {
	delete: async ({ params, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		await platform.env.DB
			.prepare('DELETE FROM historian_rating WHERE id = ?')
			.bind(Number(params.id))
			.run();
		throw redirect(303, '/admin/ratings');
	}
};

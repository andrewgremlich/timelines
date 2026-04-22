import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const SOURCE_TYPES = ['PRIMARY', 'SECONDARY', 'TERTIARY'] as const;
type SourceType = (typeof SOURCE_TYPES)[number];

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) throw error(503, 'Service unavailable');
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Invalid id');

	const source = await platform.env.DB
		.prepare('SELECT id, title, author, publication_date, url, citation, source_type FROM source WHERE id = ?')
		.bind(id)
		.first<{
			id: number;
			title: string;
			author: string | null;
			publication_date: string | null;
			url: string | null;
			citation: string | null;
			source_type: SourceType;
		}>();

	if (!source) throw error(404, 'Not found');

	const ratings = await platform.env.DB
		.prepare(
			`SELECT r.id, r.confidence_score, r.context, h.name AS historian_name
			 FROM historian_rating r
			 JOIN historian h ON h.id = r.historian_id
			 WHERE r.source_id = ?
			 ORDER BY r.rating_date DESC`
		)
		.bind(id)
		.all<{
			id: number;
			confidence_score: number | null;
			context: string | null;
			historian_name: string;
		}>();

	return { source, ratings: ratings.results };
};

export const actions: Actions = {
	update: async ({ params, request, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		const id = Number(params.id);
		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const type = String(form.get('source_type') ?? '').trim() as SourceType;

		if (!title) return fail(400, { error: 'Title is required.' });
		if (!SOURCE_TYPES.includes(type)) return fail(400, { error: 'Invalid source type.' });

		await platform.env.DB
			.prepare(
				'UPDATE source SET title = ?, author = ?, publication_date = ?, url = ?, citation = ?, source_type = ? WHERE id = ?'
			)
			.bind(
				title,
				String(form.get('author') ?? '').trim() || null,
				String(form.get('publication_date') ?? '').trim() || null,
				String(form.get('url') ?? '').trim() || null,
				String(form.get('citation') ?? '').trim() || null,
				type,
				id
			)
			.run();

		return { saved: true };
	},
	delete: async ({ params, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		await platform.env.DB.prepare('DELETE FROM source WHERE id = ?').bind(Number(params.id)).run();
		throw redirect(303, '/admin/sources');
	}
};

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const SOURCE_TYPES = ['PRIMARY', 'SECONDARY', 'TERTIARY'] as const;
type SourceType = (typeof SOURCE_TYPES)[number];

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) return { sources: [] };
	const { results } = await platform.env.DB
		.prepare('SELECT id, title, author, source_type FROM source ORDER BY title')
		.all<{ id: number; title: string; author: string | null; source_type: SourceType }>();
	return { sources: results };
};

export const actions: Actions = {
	create: async ({ request, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const type = String(form.get('source_type') ?? '').trim() as SourceType;

		if (!title) return fail(400, { error: 'Title is required.' });
		if (!SOURCE_TYPES.includes(type)) return fail(400, { error: 'Invalid source type.' });

		const result = await platform.env.DB
			.prepare(
				'INSERT INTO source (title, author, publication_date, url, citation, source_type) VALUES (?, ?, ?, ?, ?, ?)'
			)
			.bind(
				title,
				String(form.get('author') ?? '').trim() || null,
				String(form.get('publication_date') ?? '').trim() || null,
				String(form.get('url') ?? '').trim() || null,
				String(form.get('citation') ?? '').trim() || null,
				type
			)
			.run();

		throw redirect(303, `/admin/sources/${result.meta.last_row_id}`);
	}
};

import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) throw error(503, 'Service unavailable');
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Invalid id');

	const person = await platform.env.DB
		.prepare('SELECT id, name, birth_date, death_date, nationality, occupation, biography FROM person WHERE id = ?')
		.bind(id)
		.first<{
			id: number;
			name: string;
			birth_date: string | null;
			death_date: string | null;
			nationality: string | null;
			occupation: string | null;
			biography: string | null;
		}>();

	if (!person) throw error(404, 'Not found');

	const ratings = await platform.env.DB
		.prepare(
			`SELECT r.id, r.confidence_score, r.context, h.name AS historian_name
			 FROM historian_rating r
			 JOIN historian h ON h.id = r.historian_id
			 WHERE r.person_id = ?
			 ORDER BY r.rating_date DESC`
		)
		.bind(id)
		.all<{
			id: number;
			confidence_score: number | null;
			context: string | null;
			historian_name: string;
		}>();

	return { person, ratings: ratings.results };
};

export const actions: Actions = {
	update: async ({ params, request, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		const id = Number(params.id);
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		if (!name) return fail(400, { error: 'Name is required.' });

		await platform.env.DB
			.prepare(
				'UPDATE person SET name = ?, birth_date = ?, death_date = ?, nationality = ?, occupation = ?, biography = ? WHERE id = ?'
			)
			.bind(
				name,
				String(form.get('birth_date') ?? '').trim() || null,
				String(form.get('death_date') ?? '').trim() || null,
				String(form.get('nationality') ?? '').trim() || null,
				String(form.get('occupation') ?? '').trim() || null,
				String(form.get('biography') ?? '').trim() || null,
				id
			)
			.run();

		return { saved: true };
	},
	delete: async ({ params, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		await platform.env.DB.prepare('DELETE FROM person WHERE id = ?').bind(Number(params.id)).run();
		throw redirect(303, '/admin/people');
	}
};

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) return { people: [] };
	const { results } = await platform.env.DB
		.prepare('SELECT id, name, birth_date, death_date, nationality FROM person ORDER BY name')
		.all<{ id: number; name: string; birth_date: string | null; death_date: string | null; nationality: string | null }>();
	return { people: results };
};

export const actions: Actions = {
	create: async ({ request, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const birth = String(form.get('birth_date') ?? '').trim() || null;
		const death = String(form.get('death_date') ?? '').trim() || null;
		const nationality = String(form.get('nationality') ?? '').trim() || null;
		const occupation = String(form.get('occupation') ?? '').trim() || null;
		const biography = String(form.get('biography') ?? '').trim() || null;

		if (!name) return fail(400, { error: 'Name is required.' });

		const result = await platform.env.DB
			.prepare(
				'INSERT INTO person (name, birth_date, death_date, nationality, occupation, biography) VALUES (?, ?, ?, ?, ?, ?)'
			)
			.bind(name, birth, death, nationality, occupation, biography)
			.run();

		throw redirect(303, `/admin/people/${result.meta.last_row_id}`);
	}
};

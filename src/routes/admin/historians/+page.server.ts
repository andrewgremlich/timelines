import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) return { historians: [] };
	const { results } = await platform.env.DB
		.prepare('SELECT id, name, credentials, nationality, era FROM historian ORDER BY name')
		.all<{ id: number; name: string; credentials: string | null; nationality: string | null; era: string | null }>();
	return { historians: results };
};

export const actions: Actions = {
	create: async ({ request, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		if (!name) return fail(400, { error: 'Name is required.' });

		const result = await platform.env.DB
			.prepare('INSERT INTO historian (name, credentials, nationality, era) VALUES (?, ?, ?, ?)')
			.bind(
				name,
				String(form.get('credentials') ?? '').trim() || null,
				String(form.get('nationality') ?? '').trim() || null,
				String(form.get('era') ?? '').trim() || null
			)
			.run();

		throw redirect(303, `/admin/historians/${result.meta.last_row_id}`);
	}
};

import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) throw error(503, 'Service unavailable');
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Invalid id');

	const historian = await platform.env.DB
		.prepare('SELECT id, name, credentials, nationality, era FROM historian WHERE id = ?')
		.bind(id)
		.first<{
			id: number;
			name: string;
			credentials: string | null;
			nationality: string | null;
			era: string | null;
		}>();

	if (!historian) throw error(404, 'Not found');
	return { historian };
};

export const actions: Actions = {
	update: async ({ params, request, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		const id = Number(params.id);
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		if (!name) return fail(400, { error: 'Name is required.' });

		await platform.env.DB
			.prepare('UPDATE historian SET name = ?, credentials = ?, nationality = ?, era = ? WHERE id = ?')
			.bind(
				name,
				String(form.get('credentials') ?? '').trim() || null,
				String(form.get('nationality') ?? '').trim() || null,
				String(form.get('era') ?? '').trim() || null,
				id
			)
			.run();

		return { saved: true };
	},
	delete: async ({ params, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		await platform.env.DB.prepare('DELETE FROM historian WHERE id = ?').bind(Number(params.id)).run();
		throw redirect(303, '/admin/historians');
	}
};

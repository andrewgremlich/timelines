import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) throw error(503, 'Service unavailable');
	const db = platform.env.DB;
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Invalid id');

	const event = await db
		.prepare('SELECT id, title, description, start_date, end_date, location_id FROM event WHERE id = ?')
		.bind(id)
		.first<{
			id: number;
			title: string;
			description: string | null;
			start_date: string;
			end_date: string | null;
			location_id: number | null;
		}>();

	if (!event) throw error(404, 'Not found');

	const locations = await db
		.prepare('SELECT id, name FROM location ORDER BY name')
		.all<{ id: number; name: string }>();

	return { event, locations: locations.results };
};

export const actions: Actions = {
	update: async ({ params, request, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		const id = Number(params.id);
		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const description = String(form.get('description') ?? '').trim() || null;
		const startDate = String(form.get('start_date') ?? '').trim();
		const endDate = String(form.get('end_date') ?? '').trim() || null;
		const locationIdRaw = String(form.get('location_id') ?? '').trim();
		const locationId = locationIdRaw ? Number(locationIdRaw) : null;

		if (!title || !startDate) {
			return fail(400, { error: 'Title and start date are required.' });
		}

		await platform.env.DB
			.prepare(
				`UPDATE event SET title = ?, description = ?, start_date = ?, end_date = ?, location_id = ?, updated_at = datetime('now')
				 WHERE id = ?`
			)
			.bind(title, description, startDate, endDate, locationId, id)
			.run();

		return { saved: true };
	},
	delete: async ({ params, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		const id = Number(params.id);
		await platform.env.DB.prepare('DELETE FROM event WHERE id = ?').bind(id).run();
		throw redirect(303, '/admin/events');
	}
};

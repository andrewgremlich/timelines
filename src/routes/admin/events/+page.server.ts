import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) return { events: [], locations: [] };
	const db = platform.env.DB;

	const [events, locations] = await Promise.all([
		db
			.prepare(
				`SELECT e.id, e.title, e.start_date, e.end_date, l.name AS location_name
				 FROM event e LEFT JOIN location l ON l.id = e.location_id
				 ORDER BY e.start_date DESC`
			)
			.all<{
				id: number;
				title: string;
				start_date: string;
				end_date: string | null;
				location_name: string | null;
			}>(),
		db.prepare('SELECT id, name FROM location ORDER BY name').all<{ id: number; name: string }>()
	]);

	return { events: events.results, locations: locations.results };
};

export const actions: Actions = {
	create: async ({ request, platform }) => {
		if (!platform?.env?.DB) return fail(503, { error: 'Service unavailable.' });
		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const description = String(form.get('description') ?? '').trim() || null;
		const startDate = String(form.get('start_date') ?? '').trim();
		const endDate = String(form.get('end_date') ?? '').trim() || null;
		const locationIdRaw = String(form.get('location_id') ?? '').trim();
		const locationId = locationIdRaw ? Number(locationIdRaw) : null;

		if (!title || !startDate) {
			return fail(400, { error: 'Title and start date are required.', title, description, startDate, endDate, locationId });
		}

		const result = await platform.env.DB
			.prepare(
				'INSERT INTO event (title, description, start_date, end_date, location_id) VALUES (?, ?, ?, ?, ?)'
			)
			.bind(title, description, startDate, endDate, locationId)
			.run();

		throw redirect(303, `/admin/events/${result.meta.last_row_id}`);
	}
};

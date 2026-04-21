import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	isPersonLinkedToEvent,
	loadEventPayload,
	loadPerson
} from '$lib/server/timelines';

function parseIntParam(value: string | null): number | null {
	if (!value) return null;
	const n = Number(value);
	return Number.isInteger(n) && n > 0 ? n : null;
}

export const GET: RequestHandler = async ({ url, platform }) => {
	if (!platform?.env?.DB) throw error(503, 'Service unavailable');
	const db = platform.env.DB;

	const personId = parseIntParam(url.searchParams.get('person'));
	const eventId = parseIntParam(url.searchParams.get('event'));
	if (!personId || !eventId) throw error(400, 'Missing or invalid person/event parameters');

	if (!(await isPersonLinkedToEvent(db, personId, eventId))) {
		throw error(404, 'Person is not linked to that event');
	}

	const [activePerson, payload] = await Promise.all([
		loadPerson(db, personId),
		loadEventPayload(db, personId, eventId)
	]);
	if (!activePerson || !payload) throw error(404, 'Not found');

	return json(
		{ activePerson, ...payload },
		{ headers: { 'cache-control': 'private, max-age=60' } }
	);
};

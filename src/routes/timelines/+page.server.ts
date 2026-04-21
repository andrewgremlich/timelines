import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	isPersonLinkedToEvent,
	loadEventPayload,
	loadPerson,
	pickRandomActive,
	pickRandomPersonForEvent
} from '$lib/server/timelines';

function parseIntParam(value: string | null): number | null {
	if (!value) return null;
	const n = Number(value);
	return Number.isInteger(n) && n > 0 ? n : null;
}

export const load: PageServerLoad = async ({ url, platform }) => {
	if (!platform?.env?.DB) throw error(503, 'Service unavailable');
	const db = platform.env.DB;

	const personId = parseIntParam(url.searchParams.get('person'));
	const eventId = parseIntParam(url.searchParams.get('event'));

	if (!personId || !eventId) {
		const pick = await pickRandomActive(db);
		if (!pick) throw error(404, 'No timeline data seeded.');
		throw redirect(303, `/timelines?person=${pick.personId}&event=${pick.eventId}`);
	}

	const linked = await isPersonLinkedToEvent(db, personId, eventId);
	if (!linked) {
		const replacementPerson = await pickRandomPersonForEvent(db, eventId);
		if (!replacementPerson) {
			const pick = await pickRandomActive(db);
			if (!pick) throw error(404, 'No timeline data seeded.');
			throw redirect(303, `/timelines?person=${pick.personId}&event=${pick.eventId}`);
		}
		throw redirect(303, `/timelines?person=${replacementPerson}&event=${eventId}`);
	}

	const [activePerson, payload] = await Promise.all([
		loadPerson(db, personId),
		loadEventPayload(db, personId, eventId)
	]);

	if (!activePerson || !payload) {
		const pick = await pickRandomActive(db);
		if (!pick) throw error(404, 'No timeline data seeded.');
		throw redirect(303, `/timelines?person=${pick.personId}&event=${pick.eventId}`);
	}

	return { activePerson, ...payload };
};

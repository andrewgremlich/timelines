import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { invalidateSession, clearSessionCookie, SESSION_COOKIE } from '$lib/server/session';

export const POST: RequestHandler = async ({ cookies, platform }) => {
	const db = platform!.env.DB;
	const token = cookies.get(SESSION_COOKIE);

	if (token) {
		await invalidateSession(db, token);
	}

	return json(
		{ message: 'Logged out.' },
		{ status: 200, headers: { 'Set-Cookie': clearSessionCookie() } }
	);
};

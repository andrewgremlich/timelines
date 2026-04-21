import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { invalidateSession, clearSessionCookie, SESSION_COOKIE } from '$lib/server/session';

export const POST: RequestHandler = async ({ cookies, platform }) => {
	if (!platform?.env?.DB) {
		return json({ error: 'Service unavailable.' }, { status: 503 });
	}
	const token = cookies.get(SESSION_COOKIE);

	if (token) {
		await invalidateSession(platform.env.DB, token);
	}

	return json(
		{ message: 'Logged out.', redirect: '/' },
		{ status: 200, headers: { 'Set-Cookie': clearSessionCookie() } }
	);
};

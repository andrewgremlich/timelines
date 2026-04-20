import type { Handle } from '@sveltejs/kit';
import { validateSessionToken, SESSION_COOKIE } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);

	if (token && event.platform?.env.DB) {
		const session = await validateSessionToken(event.platform.env.DB, token);
		if (session) {
			event.locals.user = { id: session.userId, email: session.email, role: session.role };
			event.locals.session = { id: session.sessionId, expiresAt: session.expiresAt };
		}
	}

	return resolve(event);
};

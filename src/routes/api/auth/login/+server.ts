import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyPassword } from '$lib/server/password';
import { generateSessionToken, createSession, makeSessionCookie } from '$lib/server/session';
import { checkRateLimit } from '$lib/server/rateLimit';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = platform!.env.DB;
	const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';

	console.log('Login attempt from IP:', ip);

	// const { allowed } = await checkRateLimit(db, `login:${ip}`);
	// if (!allowed) {
	// 	return json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
	// }

	// const raw = await request.json().catch(() => null) as Record<string, unknown> | null;
	// if (!raw || typeof raw.email !== 'string' || typeof raw.password !== 'string') {
	// 	return json({ error: 'Invalid request body.' }, { status: 400 });
	// }

	// const email = raw.email.trim().toLowerCase();
	// const password = raw.password;

	// const user = await db
	// 	.prepare('SELECT id, password_hash FROM user WHERE email = ?')
	// 	.bind(email)
	// 	.first<{ id: number; password_hash: string }>();

	// // Run verifyPassword even on missing user to prevent timing attacks
	// const dummyHash = 'AAAAAAAAAAAAAAAAAAAAAA==:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
	// const valid = user ? await verifyPassword(user.password_hash, password) : await verifyPassword(dummyHash, password).then(() => false);

	// if (!user || !valid) {
	// 	return json({ error: 'Invalid email or password.' }, { status: 401 });
	// }

	// const token = generateSessionToken();
	// const session = await createSession(db, token, user.id);
	// const cookie = makeSessionCookie(token, session.expiresAt);

	return json(
		{ message: 'Logged in.' },
		// { status: 200, headers: { 'Set-Cookie': cookie } }
	);
};

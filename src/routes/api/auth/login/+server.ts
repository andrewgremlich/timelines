import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyPassword } from '$lib/server/password';
import { generateSessionToken, createSession, makeSessionCookie } from '$lib/server/session';
import { checkRateLimit } from '$lib/server/rateLimit';

const DUMMY_HASH =
	'AAAAAAAAAAAAAAAAAAAAAA==:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env?.DB) {
		return json({ error: 'Service unavailable.' }, { status: 503 });
	}
	const db = platform.env.DB;
	const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';

	const { allowed } = await checkRateLimit(db, `login:${ip}`);
	if (!allowed) {
		return json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
	}

	const body = new URLSearchParams(await request.text());
	const email = body.get('email')?.trim().toLowerCase();
	const password = body.get('password');

	if (!email || !password) {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	const user = await db
		.prepare('SELECT id, password_hash FROM user WHERE email = ?')
		.bind(email)
		.first<{ id: number; password_hash: string }>();

	const hashToCheck = user?.password_hash ?? DUMMY_HASH;
	const passwordMatch = await verifyPassword(hashToCheck, password);

	if (!user || !passwordMatch) {
		return json({ error: 'Invalid email or password.' }, { status: 401 });
	}

	const token = generateSessionToken();
	const session = await createSession(db, token, user.id);
	const cookie = makeSessionCookie(token, session.expiresAt);

	return json(
		{ message: 'Logged in.', redirect: '/' },
		{ status: 200, headers: { 'Set-Cookie': cookie } }
	);
};

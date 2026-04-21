import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hashPassword } from '$lib/server/password';
import { checkRateLimit } from '$lib/server/rateLimit';

const GENERIC_SUCCESS = { message: 'If that address is new, you can now log in.' };

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env?.DB) {
		return json({ error: 'Service unavailable.' }, { status: 503 });
	}
	const db = platform.env.DB;
	const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';

	const { allowed } = await checkRateLimit(db, `register:${ip}`);
	if (!allowed) {
		return json({ error: 'Too many registration attempts. Try again later.' }, { status: 429 });
	}

	const registrationData = new URLSearchParams(await request.text());
	const email = registrationData.get('email')?.trim().toLowerCase();
	const password = registrationData.get('password');

	if (!email || !password) {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return json({ error: 'Invalid email address.' }, { status: 400 });
	}
	if (password.length < 12 || password.length > 64) {
		return json({ error: 'Password must be between 12 and 64 characters.' }, { status: 400 });
	}

	const passwordHash = await hashPassword(password);

	try {
		await db
			.prepare('INSERT INTO user (email, password_hash, role) VALUES (?, ?, ?)')
			.bind(email, passwordHash, 'USER')
			.run();
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		if (/UNIQUE/i.test(message)) {
			return json(GENERIC_SUCCESS, { status: 200 });
		}
		throw err;
	}

	return json(GENERIC_SUCCESS, { status: 201 });
};

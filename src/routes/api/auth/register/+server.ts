import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hashPassword } from '$lib/server/password';
import { checkRateLimit } from '$lib/server/rateLimit';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = platform!.env.DB;
	const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';

	console.log(`Register attempt from IP: ${ip}`);

	// const { allowed } = await checkRateLimit(db, `register:${ip}`);
	// if (!allowed) {
	// 	return json({ error: 'Too many registration attempts. Try again later.' }, { status: 429 });
	// }

	// const raw = await request.json().catch(() => null) as Record<string, unknown> | null;
	// if (!raw || typeof raw.email !== 'string' || typeof raw.password !== 'string') {
	// 	return json({ error: 'Invalid request body.' }, { status: 400 });
	// }

	// const email = raw.email.trim().toLowerCase();
	// const password = raw.password;

	// if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
	// 	return json({ error: 'Invalid email address.' }, { status: 400 });
	// }
	// if (password.length < 8) {
	// 	return json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
	// }

	// const existing = await db
	// 	.prepare('SELECT id FROM user WHERE email = ?')
	// 	.bind(email)
	// 	.first();
	// if (existing) {
	// 	// Don't reveal whether the email exists
	// 	return json({ message: 'If that address is new, you can now log in.' }, { status: 200 });
	// }

	// const passwordHash = await hashPassword(password);
	// await db
	// 	.prepare('INSERT INTO user (email, password_hash, role) VALUES (?, ?, ?)')
	// 	.bind(email, passwordHash, 'USER')
	// 	.run();

	return json({ message: 'Account created.' }, { status: 201 });
};

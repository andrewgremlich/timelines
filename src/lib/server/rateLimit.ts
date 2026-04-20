
const WINDOW_MS = 1000 * 60 * 15; // 15-minute window
const MAX_ATTEMPTS = 5;

export async function checkRateLimit(db: D1Database, key: string): Promise<{ allowed: boolean; remaining: number }> {
	const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();
	await db.prepare('DELETE FROM rate_limit WHERE attempted_at < ?').bind(windowStart).run();

	const { count } = await db
		.prepare('SELECT COUNT(*) as count FROM rate_limit WHERE key = ? AND attempted_at > ?')
		.bind(key, windowStart)
		.first<{ count: number }>() ?? { count: 0 };

	const allowed = count < MAX_ATTEMPTS;
	if (allowed) {
		await db
			.prepare('INSERT INTO rate_limit (key, attempted_at) VALUES (?, ?)')
			.bind(key, new Date().toISOString())
			.run();
	}

	return { allowed, remaining: Math.max(0, MAX_ATTEMPTS - count - 1) };
}

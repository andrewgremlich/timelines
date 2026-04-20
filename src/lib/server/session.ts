import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const SESSION_COOKIE = 'session';

export function generateSessionToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	return encodeBase32LowerCaseNoPadding(bytes);
}

function tokenToId(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export async function createSession(db: D1Database, token: string, userId: number) {
	const id = tokenToId(token);
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
	await db
		.prepare('INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)')
		.bind(id, userId, expiresAt)
		.run();
	return { id, userId, expiresAt };
}

export async function validateSessionToken(db: D1Database, token: string) {
	const id = tokenToId(token);
	const row = await db
		.prepare(
			`SELECT s.id, s.user_id, s.expires_at, u.email, u.role
       FROM session s JOIN user u ON u.id = s.user_id
       WHERE s.id = ?`
		)
		.bind(id)
		.first<{ id: string; user_id: number; expires_at: string; email: string; role: string }>();

	if (!row) return null;
	if (new Date(row.expires_at) < new Date()) {
		await db.prepare('DELETE FROM session WHERE id = ?').bind(id).run();
		return null;
	}

	// Sliding window: extend if within the last half of the session lifetime
	const halfLife = SESSION_DURATION_MS / 2;
	if (new Date(row.expires_at).getTime() - Date.now() < halfLife) {
		const newExpiry = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
		await db.prepare('UPDATE session SET expires_at = ? WHERE id = ?').bind(newExpiry, id).run();
		row.expires_at = newExpiry;
	}

	return { sessionId: row.id, userId: row.user_id, email: row.email, role: row.role, expiresAt: row.expires_at };
}

export async function invalidateSession(db: D1Database, token: string) {
	const id = tokenToId(token);
	await db.prepare('DELETE FROM session WHERE id = ?').bind(id).run();
}

export function makeSessionCookie(token: string, expiresAt: string): string {
	const expires = new Date(expiresAt).toUTCString();
	return `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Expires=${expires}; Secure`;
}

export function clearSessionCookie(): string {
	return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0; Secure`;
}

#!/usr/bin/env node
// Seed a local admin user. Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='something-long' \
//     node --experimental-strip-types scripts/seed-admin.ts | \
//     pnpm wrangler d1 execute timelines --local --command="$(cat)"
//
// Or write to a file and pipe:
//   ... > /tmp/seed.sql && pnpm wrangler d1 execute timelines --local --file=/tmp/seed.sql
//
// Keep PBKDF2 params in sync with src/lib/server/password.ts.

const ITERATIONS = 310_000;
const KEY_LENGTH = 32;
const HASH_ALGORITHM = 'SHA-256';

function bufferToBase64(buf: ArrayBuffer): string {
	let binary = '';
	for (const byte of new Uint8Array(buf)) binary += String.fromCharCode(byte);
	return btoa(binary);
}

async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);
	const derived = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH_ALGORITHM },
		keyMaterial,
		KEY_LENGTH * 8
	);
	return `${bufferToBase64(salt.buffer as ArrayBuffer)}:${bufferToBase64(derived)}`;
}

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
	console.error('ADMIN_EMAIL and ADMIN_PASSWORD env vars are required.');
	process.exit(1);
}
if (password.length < 12) {
	console.error('ADMIN_PASSWORD must be at least 12 characters.');
	process.exit(1);
}

const hash = await hashPassword(password);

// SQL-escape single quotes by doubling them.
const safeEmail = email.replace(/'/g, "''");
const safeHash = hash.replace(/'/g, "''");

process.stdout.write(
	`INSERT INTO user (email, password_hash, role) VALUES ('${safeEmail}', '${safeHash}', 'ADMIN') ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, role = 'ADMIN';\n`
);

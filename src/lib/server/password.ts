import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

// Argon2id via WebCrypto is not available in Workers; we use PBKDF2 which is.
const ITERATIONS = 310_000;
const KEY_LENGTH = 32;
const HASH_ALGORITHM = 'SHA-256';

function bufferToBase64(buf: ArrayBuffer): string {
	let binary = '';
	const bytes = new Uint8Array(buf);
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

function base64ToBuffer(b64: string): Uint8Array<ArrayBuffer> {
	return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
}

export async function hashPassword(password: string): Promise<string> {
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

export async function verifyPassword(stored: string, candidate: string): Promise<boolean> {
	const [saltB64, hashB64] = stored.split(':');
	if (!saltB64 || !hashB64) return false;
	const salt = base64ToBuffer(saltB64);
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(candidate),
		'PBKDF2',
		false,
		['deriveBits']
	);
	const derived = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH_ALGORITHM },
		keyMaterial,
		KEY_LENGTH * 8
	);
	const candidateHash = bufferToBase64(derived);
	// Constant-time comparison via sha256 of both sides
	const a = encodeHexLowerCase(sha256(new TextEncoder().encode(candidateHash)));
	const b = encodeHexLowerCase(sha256(new TextEncoder().encode(hashB64)));
	return a === b;
}

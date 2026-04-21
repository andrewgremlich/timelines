<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Button from './button.svelte';

	interface Props {
		user?: { id: number; email: string; role: string } | null;
	}

	let { user = null }: Props = $props();
	let loggingOut = $state(false);

	async function logout() {
		if (loggingOut) return;
		loggingOut = true;
		try {
			const res = await fetch('/api/auth/logout', { method: 'POST' });
			const data = (await res.json().catch(() => ({}))) as { redirect?: string };
			await invalidateAll();
			await goto(data.redirect ?? '/');
		} finally {
			loggingOut = false;
		}
	}
</script>

<nav>
	<div>
		<a href="/">Home</a>
		<a href="/timelines">Timelines</a>
		{#if user?.role === 'ADMIN'}
			<a href="/admin">Admin</a>
		{/if}
	</div>
	<div>
		{#if user}
			<span aria-label="Signed in as">{user.email}</span>
			<Button
				type="button"
				size="small"
				onclick={logout}
				disabled={loggingOut}
				label={loggingOut ? 'Signing out…' : 'Logout'}
			/>
		{:else}
			<a href="/login">Login</a>
			<a href="/register">Register</a>
		{/if}
	</div>
</nav>

<style>
	nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		color: var(--text);
		background-color: var(--bg-subtle);
	}

	nav div:first-child {
		display: flex;
		gap: 2rem;
	}

	nav div:last-child {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	button {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		font: inherit;
		padding: 0;
		text-decoration: underline;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>

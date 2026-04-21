<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Input from '$lib/components/input.svelte';
	import Form from '$lib/components/form.svelte';
	import Button from '$lib/components/button.svelte';

	let error = $state('');
	let submitting = $state(false);

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		if (submitting) return;
		submitting = true;
		error = '';

		const form = event.currentTarget as HTMLFormElement;
		const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body
			});
			const data = (await res.json()) as { redirect?: string; error?: string };
			if (res.ok) {
				await invalidateAll();
				await goto(data.redirect ?? '/');
			} else {
				error = data.error ?? 'Login failed.';
			}
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<h1>Login</h1>

<Form action="/api/auth/login" method="POST" {onsubmit}>
	<Input label="Email" name="email" type="email" required />
	<Input label="Password" name="password" type="password" required />
	<Button label={submitting ? 'Signing in…' : 'Login'} type="submit" variant="primary" />
</Form>

{#if error}
	<p role="alert">{error}</p>
{/if}

<p>No account? <a href="/register">Register here</a>.</p>

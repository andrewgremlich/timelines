<script lang="ts">
	import Input from '$lib/components/input.svelte';
	import Form from '$lib/components/form.svelte';
	import Button from '$lib/components/button.svelte';

	let message = $state('');
	let error = $state('');
	let submitting = $state(false);

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		if (submitting) return;
		submitting = true;
		message = '';
		error = '';

		const form = event.currentTarget as HTMLFormElement;
		const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);

		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body
			});
			const data = (await res.json()) as { message?: string; error?: string };
			if (res.ok) {
				message = data.message ?? 'Account created.';
				form.reset();
			} else {
				error = data.error ?? 'Registration failed.';
			}
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<h1>Register</h1>

<Form action="/api/auth/register" method="POST" {onsubmit}>
	<Input label="Email" name="email" type="email" required />
	<Input label="Password" name="password" type="password" required minlength="12" maxlength="64" />
	<Button label={submitting ? 'Registering…' : 'Register'} type="submit" variant="primary" />
</Form>

{#if message}
	<p role="status">{message}</p>
{/if}
{#if error}
	<p role="alert">{error}</p>
{/if}

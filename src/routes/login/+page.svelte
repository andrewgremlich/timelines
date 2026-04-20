<script>
	import Input from '$lib/components/input.svelte';
	import Form from '$lib/components/form.svelte';
	import Button from '$lib/components/button.svelte';
</script>

<h1>Login</h1>

<Form action="/api/auth/login" method="POST">
	<Input label="Username" name="username" type="text" required />
	<Input label="Password" name="password" type="password" required />
	<Button label="Login" type="submit" variant="primary" />
</Form>

<p>No account? <a href="/register">Register here</a>.</p>

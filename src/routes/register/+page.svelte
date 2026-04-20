<script>
	import Input from '$lib/components/input.svelte';
	import Form from '$lib/components/form.svelte';
	import Button from '$lib/components/button.svelte';
</script>

<h1>Register</h1>

<Form action="/api/auth/register" method="POST">
	<Input label="Username" name="username" type="text" required />
	<Input label="Email" name="email" type="email" required />
	<Input label="Password" name="password" type="password" required />
	<Button label="Register" type="submit" variant="primary" />
</Form>

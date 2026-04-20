<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		action?: string;
		method?: 'GET' | 'POST';
		[key: string]: unknown;
	}

	let { children, action, method = 'GET', ...rest }: Props = $props();
</script>

<form {action} {method} {...rest}>
	{@render children()}
</form>

<style>
	form {
		max-width: 400px;
		margin: 0 auto;
		padding: 2rem;
	}
</style>

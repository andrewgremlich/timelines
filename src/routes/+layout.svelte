<script lang="ts">
	import './reset.css';
	import '@fontsource/merriweather-sans'; // Defaults to weight 400
	import '@fontsource/merriweather-sans/400.css'; // Specify weight
	import './main.css';

	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/nav.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Nav user={data.user} />

<main>
	{@render children()}
</main>

<style>
	main {
		--main-max-width: 800px;
		max-width: var(--main-max-width);
		margin: 2rem auto;
	}
</style>

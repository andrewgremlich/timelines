<script lang="ts">
	let { children } = $props();
</script>

<section>
	<nav class="admin-nav">
		<a href="/admin">Dashboard</a>
		<a href="/admin/events">Events</a>
		<a href="/admin/people">People</a>
		<a href="/admin/sources">Sources</a>
		<a href="/admin/historians">Historians</a>
	</nav>
	{@render children()}
</section>

<style>
	.admin-nav {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--slate-400);
	}
</style>

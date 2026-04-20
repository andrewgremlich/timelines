<script lang="ts">
	console.log('hello world');
</script>

<nav>
	<div>
		<a href="/">Home</a>
		<a href="/admin">Admin</a>
		<a href="/timelines">Timelines</a>
	</div>
	<div>
		<a href="/login">Login</a>
	</div>
</nav>

<style>
	nav {
		display: flex;
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
	}
</style>

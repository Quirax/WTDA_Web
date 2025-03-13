<script lang="ts">
	import MainPage from '../stories/MainPage.svelte';

	let user = $state<{ name: string }>();
</script>

<MainPage
	{user}
	onLogin={() => (user = { name: 'Jane Doe' })}
	onLogout={() => (user = undefined)} />

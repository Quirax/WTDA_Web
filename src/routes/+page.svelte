<script lang="ts">
	import MainPage from '../stories/MainPage.svelte';

	let user = $state<App.User>();
</script>

<MainPage
	{user}
	onLogin={() => (user = { id: 'quiraxical', username: 'Quirax Lee' })}
	onLogout={() => (user = undefined)} />

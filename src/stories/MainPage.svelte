<svelte:options runes />

<script lang="ts">
	import './MainPage.css';
	import Header from './Header.svelte';

	let user = $state<{ name: string }>();
</script>

<article>
	<Header
		{user}
		onLogin={() => (user = { name: 'Jane Doe' })}
		onLogout={() => (user = undefined)}
	/>
	<!-- Advertising Carousel -->
	<!-- Card list of opened commission types -->
	<!-- Card list of opened requests -->
</article>

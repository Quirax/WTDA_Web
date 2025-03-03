<script lang="ts">
	import 'svelte-material-ui/bare.css';
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import IconButton from '@smui/icon-button';

	import './header.css';

	interface Props {
		user?: { name: string };
		onLogin?: () => void;
		onLogout?: () => void;
		onCreateAccount?: () => void;
	}

	const { user, onLogin, onLogout, onCreateAccount }: Props = $props();
</script>

<svelte:head>
	<!-- Material Icons -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
	<!-- Roboto -->
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700"
	/>
	<!-- Roboto Mono -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono" />
</svelte:head>

<header>
	<TopAppBar variant="static" color="primary">
		<Row>
			<Section>
				<IconButton class="material-icons">menu</IconButton>
				<Title>Flex Static</Title>
			</Section>
			<Section align="end" toolbar>
				{#if user}
					<IconButton class="material-icons" aria-label={user.name}>file_download</IconButton>
					<IconButton class="material-icons" aria-label="Download">file_download</IconButton>
				{:else}
					<IconButton class="material-icons" aria-label="Download">file_download</IconButton>
					<IconButton class="material-icons" aria-label="Download">file_download</IconButton>
				{/if}
			</Section>
		</Row>
	</TopAppBar>
</header>

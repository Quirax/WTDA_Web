<script lang="ts">
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import IconButton from '@smui/icon-button';
	import Tooltip, { Wrapper } from '@smui/tooltip';

	import './header.css';

	interface Props {
		user?: { name: string };
		onLogin?: () => void;
		onLogout?: () => void;
		onCreateAccount?: () => void;
		isDarkMode?: boolean;
	}

	const { user, onLogin, onLogout, onCreateAccount, isDarkMode }: Props = $props();
</script>

<header class={isDarkMode ? 'dark' : 'light'}>
	<TopAppBar variant="static" color="primary">
		<Row>
			<Section>
				<Title>What-To-Do Atelier</Title>
			</Section>
			<Section align="end" toolbar>
				{#if user}
					<Wrapper>
						<IconButton class="material-icons" aria-label="Notifications">notifications</IconButton>
						<Tooltip>No notification is received</Tooltip>
					</Wrapper>
					<Wrapper>
						<IconButton class="material-icons" aria-label="Direct Messages">forum</IconButton>
						<Tooltip>No direct message is received</Tooltip>
					</Wrapper>
					<Wrapper>
						<IconButton class="material-icons" aria-label="User Menu">account_circle</IconButton>
						<Tooltip>{user.name}</Tooltip>
					</Wrapper>
				{:else}
					<Wrapper>
						<IconButton class="material-icons" aria-label="Login">login</IconButton>
						<Tooltip>Login</Tooltip>
					</Wrapper>
				{/if}
			</Section>
		</Row>
	</TopAppBar>
</header>

<svelte:head>
	<style>
		header.light {
			--mdc-theme-primary: white;
			--mdc-theme-secondary: #fff;
			--mdc-theme-background: #fff;
			--mdc-theme-surface: #fff;
			--mdc-theme-on-primary: black;
			--mdc-theme-on-secondary: black;
			--mdc-theme-on-surface: black;
		}

		header.light .mdc-top-app-bar {
			color: black;
		}

		header.dark {
			--mdc-theme-primary: #000;
			--mdc-theme-secondary: #676778;
			--mdc-theme-background: #000;
			--mdc-theme-surface: #999;
			--mdc-theme-on-primary: white;
			--mdc-theme-on-secondary: white;
			--mdc-theme-on-surface: white;
		}

		header.dark .mdc-top-app-bar {
			color: white;
		}
	</style>
</svelte:head>

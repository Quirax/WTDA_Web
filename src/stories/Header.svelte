<script lang="ts">
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import IconButton, { Icon } from '@smui/icon-button';
	import Tooltip, { Wrapper } from '@smui/tooltip';

	import './header.css';
	import logo from './assets/logo.png';

	interface Props {
		user?: { name: string };
		onLogin?: () => void;
		onLogout?: () => void;
		onCreateAccount?: () => void;
		isDarkMode?: boolean;
	}

	const { user, onLogin, onLogout, onCreateAccount, isDarkMode }: Props = $props();
</script>

<TopAppBar class={isDarkMode ? 'dark' : 'light'} variant="static" color="primary">
	<Row>
		<Section>
			<img class="logo" src={logo} alt="Logo" />
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
			color: white;
		}

		header img.logo {
			height: 24px;
			width: 24px;
			padding: 12px;
			background-color: white;
			border-radius: 36px;
		}
	</style>
</svelte:head>

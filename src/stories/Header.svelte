<script lang="ts">
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import IconButton, { Icon } from '@smui/icon-button';
	import Tooltip, { Wrapper } from '@smui/tooltip';

	import './header.css';
	import logo from './assets/logo.png';
	import { onMount } from 'svelte';
	import type { Action } from 'svelte/action';

	interface Props {
		user?: { name: string };
		onLogin?: () => void;
		onLogout?: () => void;
		isDarkMode?: boolean;
	}

	const { user, onLogin, onLogout, isDarkMode }: Props = $props();

	const tooltips: HTMLElement[] = [];

	const registerTooltips: Action = (node: HTMLElement) => {
		tooltips.push(node);
		console.log(tooltips);
	};

	$effect.pre(() => {
		user?.name;

		tooltips.splice(0).forEach((node) => {
			node.parentElement?.removeChild(node);
		});
	});

	$inspect(tooltips);
</script>

<TopAppBar class={isDarkMode ? 'dark' : 'light'} variant="static" color="primary">
	<Row>
		<Section>
			<img class="logo" src={logo} alt="Logo" />
			<Title>What-To-Do Atelier</Title>
		</Section>

		{#if user}
			<Section align="end" toolbar>
				<Wrapper>
					<IconButton class="material-icons" aria-label="Notifications">notifications</IconButton>
					<Tooltip use={[registerTooltips]}>No notification is received</Tooltip>
				</Wrapper>
				<Wrapper>
					<IconButton class="material-icons" aria-label="Direct Messages">forum</IconButton>
					<Tooltip use={[registerTooltips]}>No direct message is received</Tooltip>
				</Wrapper>
				<Wrapper>
					<IconButton class="material-icons" aria-label="User Menu" onclick={onLogout}
						>account_circle</IconButton
					>
					<Tooltip use={[registerTooltips]}>{user.name}</Tooltip>
				</Wrapper>
			</Section>
		{:else}
			<Section align="end" toolbar>
				<Wrapper>
					<IconButton class="material-icons" aria-label="Login" onclick={onLogin}>login</IconButton>
					<Tooltip use={[registerTooltips]}>Login</Tooltip>
				</Wrapper>
			</Section>
		{/if}
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

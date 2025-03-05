<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';

	import './header.css';
	import logo from './assets/logo.png';

	interface Props {
		user?: { name: string };
		title?: string;
		onLogin?: () => void;
		onLogout?: () => void;
	}

	const { user, onLogin, onLogout, title = 'What-To-Do Atelier' }: Props = $props();
</script>

<div class="border-b">
	<div class="flex h-16 items-center px-4">
		<!-- <TeamSwitcher /> -->
		<Avatar.Root class="bg-white p-1">
			<Avatar.Image src={logo} alt="What-To-Do Atelier logo" />
			<Avatar.Fallback>WTDA</Avatar.Fallback>
		</Avatar.Root>
		<div class="mx-6 flex items-center space-x-4 font-bold lg:space-x-6">{title}</div>
		<div class="ml-auto flex items-center space-x-4">
			<!-- <Search /> -->
			<!-- <UserNav /> -->
			{#if user}
				{user.name}
			{:else}
				로그인
			{/if}
		</div>
	</div>
</div>

<!-- <TopAppBar class={isDarkMode ? 'dark' : 'light'} variant="static" color="primary">
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
					<IconButton class="material-icons" aria-label="Log in" onclick={onLogin}>login</IconButton
					>
					<Tooltip use={[registerTooltips]}>Log in</Tooltip>
				</Wrapper>
			</Section>
		{/if}
	</Row>
</TopAppBar> -->

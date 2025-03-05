<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

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

<header class="border-b">
	<div class="flex h-16 items-center px-4">
		<Avatar.Root class="bg-white p-1">
			<Avatar.Image src={logo} alt="What-To-Do Atelier logo" />
			<Avatar.Fallback>WA</Avatar.Fallback>
		</Avatar.Root>
		<div class="mx-6 flex items-center space-x-4 font-bold lg:space-x-6">{title}</div>
		<div class="ml-auto flex items-center space-x-4">
			<Input type="search" placeholder="Search..." class="h-9 md:w-[100px] lg:w-[300px]" />
			{#if user}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button variant="ghost" builders={[builder]} class="relative h-8 w-8 rounded-full">
							<Avatar.Root class="h-8 w-8">
								<Avatar.Image src="/avatars/01.png" alt="@{user.name}" />
								<Avatar.Fallback>??</Avatar.Fallback><!-- TODO: auto-generate fallback -->
							</Avatar.Root>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" align="end">
						<DropdownMenu.Label class="font-normal">
							<div class="flex flex-col space-y-1">
								<p class="text-sm leading-none font-medium">{user.name}</p>
								<p class="text-muted-foreground text-xs leading-none">m@example.com</p>
								<!-- TODO: email? -->
							</div>
						</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Group>
							<DropdownMenu.Item>
								Profile
								<DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								Billing
								<DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								Settings
								<DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
							</DropdownMenu.Item>
							<DropdownMenu.Item>New Team</DropdownMenu.Item>
						</DropdownMenu.Group>
						<DropdownMenu.Separator />
						<DropdownMenu.Item>
							Log out
							<DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				로그인
			{/if}
		</div>
	</div>
</header>

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

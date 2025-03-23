<script lang="ts">
	import * as LogoAvatar from '$lib/components/ui/avatar';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import UserAvatar from './Avatar.svelte';

	import './header.css';
	import logo from '../assets/logo.png';
	import { fn } from '@storybook/test';

	interface Props {
		user?: App.User;
		title?: string;
		onLogin?: () => void;
		onLogout?: () => void;
		showSearchPanel?: boolean;
		showUserPanel?: boolean;
	}

	const {
		user,
		onLogin = fn(),
		onLogout = fn(),
		title = '뭐하지공방',
		showSearchPanel = true,
		showUserPanel = true,
	}: Props = $props();
</script>

<header class="bg-background border-b-2">
	<div class="flex h-16 items-center px-4">
		<a href="/" class="relative size-9 rounded-full" aria-label="Logo">
			<LogoAvatar.Root class="bg-white p-1">
				<LogoAvatar.Image src={logo} alt="뭐하지공방 로고" />
				<LogoAvatar.Fallback>WA</LogoAvatar.Fallback>
			</LogoAvatar.Root>
		</a>
		<div class="mx-6 hidden items-center space-x-4 font-bold sm:flex lg:space-x-6">
			{title}
		</div>
		<div class="ml-auto flex items-center space-x-4">
			{#if showSearchPanel}
				<div class="hidden space-x-2 sm:flex">
					<Input type="search" placeholder="검색..." class="h-9 w-[100px] sm:flex lg:w-[300px]" />
					<Button class="h-9" aria-label="Search">검색</Button>
				</div>
			{/if}
			{#if showUserPanel}
				{#if user}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="ghost" class="relative size-9 rounded-full" aria-label="User Menu">
								<UserAvatar class="size-9" {user} />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56" align="end">
							<DropdownMenu.Label class="font-normal">
								<div class="flex flex-col space-y-1">
									<p class="text-sm leading-none font-medium">{user.username}</p>
									<p class="text-muted-foreground text-xs leading-none">@{user.username}</p>
									<!-- TODO: email? -->
								</div>
							</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Item>알림</DropdownMenu.Item>
								<DropdownMenu.Item>대화</DropdownMenu.Item>
								<DropdownMenu.Item>설정</DropdownMenu.Item>
							</DropdownMenu.Group>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onclick={onLogout}>로그아웃</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<Button class="h-9 w-[6em]" aria-label="Log in" onclick={onLogin}>로그인</Button>
					<Button class="h-9 w-[6em]" aria-label="Sign up">회원가입</Button>
				{/if}
			{/if}
		</div>
	</div>
</header>

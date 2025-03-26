<script lang="ts">
	import * as LogoAvatar from '$lib/components/ui/avatar';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import UserAvatar from './Avatar.svelte';

	import './header.css';
	import logo from '../assets/logo.png';
	import { fn } from '@storybook/test';
	import { userStore } from '$lib/context';
	import { goto } from '$app/navigation';

	interface Props {
		title?: string;
		onLogin?: () => void;
		onLogout?: () => void;
		showSearchPanel?: boolean;
		showUserPanel?: boolean;
	}

	const {
		onLogin = fn(),
		onLogout = fn(),
		title = '뭐하지공방',
		showSearchPanel = true,
		showUserPanel = true,
	}: Props = $props();

	let user = $state<App.User>(null);

	userStore.subscribe((v) => (user = v));
</script>

<header class="border-b-2 bg-background">
	<div class="flex items-center justify-between h-16 px-4">
		<div class="flex items-center">
			<a href="/" class="relative rounded-full size-9" aria-label="Logo">
				<LogoAvatar.Root class="p-1 bg-white">
					<LogoAvatar.Image src="/logo.png" alt="뭐하지공방 로고" />
					<LogoAvatar.Fallback>WA</LogoAvatar.Fallback>
				</LogoAvatar.Root>
			</a>
			<div class="items-center hidden mx-6 space-x-4 font-bold sm:flex lg:space-x-6">
				{title}
			</div>
		</div>
		<div class="flex items-center space-x-4">
			{#if showSearchPanel}
				<div class="hidden sm:flex">
					<Input type="search" placeholder="검색..." class="h-9 w-[100px] sm:flex lg:w-[300px]" />
					<Button class="h-9" aria-label="Search">검색</Button>
				</div>
			{/if}{#if showUserPanel}
				{#if user}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="p-0 m-0">
							{#snippet child({ props })}
								<Button
									{...props}
									variant="ghost"
									class="p-0 rounded-full size-9"
									aria-label="User Menu">
									<UserAvatar class="size-9" {user} />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56" align="end">
							<DropdownMenu.Label class="font-normal">
								<div class="flex flex-col space-y-1">
									<p class="text-sm font-medium leading-none">{user.username}</p>
									<p class="text-xs leading-none text-muted-foreground">{user.email}</p>
								</div>
							</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Item onclick={() => goto('/user/info')}>내 정보</DropdownMenu.Item>
							</DropdownMenu.Group>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onclick={onLogout}>로그아웃</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<Button class="h-9 w-[6em]" aria-label="Log in" onclick={onLogin}>로그인</Button>
					<Button class="h-9 w-[6em]" aria-label="Sign up" href="/register">회원가입</Button>
				{/if}
			{/if}
		</div>
	</div>
</header>

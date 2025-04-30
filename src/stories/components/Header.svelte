<script lang="ts">
	import * as LogoAvatar from '$lib/components/ui/avatar';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import UserAvatar from './Avatar.svelte';

	import './header.css';
	import { userStore } from '$lib/context';
	import { goto } from '$app/navigation';

	interface Props {
		title?: string;
		showSearchPanel?: boolean;
		showUserPanel?: boolean;
	}

	const { title = '뭐하지공방', showSearchPanel = true, showUserPanel = true }: Props = $props();

	let user = $state<App.User>(null);

	userStore.subscribe((v) => (user = v));

	const onLogin = () => {
		goto('/login');
	};
	const onLogout = () => {
		goto('/logout');
	};
</script>

<svelte:head>
	<title>{title === '뭐하지공방' ? '' : title + ' - '}뭐하지공방</title>
</svelte:head>

<header class="bg-background border-b-2">
	<div class="flex h-16 items-center justify-between px-4">
		<div class="flex items-center">
			<Button
				variant="link"
				size="icon"
				href="/"
				class="relative size-9 rounded-full"
				aria-label="Logo">
				<LogoAvatar.Root class="bg-white p-1">
					<LogoAvatar.Image src="/logo.png" alt="뭐하지공방 로고" />
					<LogoAvatar.Fallback>WA</LogoAvatar.Fallback>
				</LogoAvatar.Root>
			</Button>
			<div class="mx-6 hidden items-center space-x-4 font-bold sm:flex lg:space-x-6">
				{title}
			</div>
		</div>
		<div class="flex items-center space-x-4">
			{#if showSearchPanel}
				<form class="hidden sm:flex" method="GET" action="/search">
					<Input
						type="search"
						name="query"
						placeholder="검색..."
						class="h-9 w-[100px] sm:flex lg:w-[300px]" />
					<Button type="submit" class="h-9" aria-label="Search">검색</Button>
				</form>
			{/if}{#if showUserPanel}
				{#if user}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="m-0 p-0">
							{#snippet child({ props })}
								<Button
									{...props}
									variant="ghost"
									class="size-9 rounded-full p-0"
									aria-label="User Menu">
									<UserAvatar class="size-9" {user} />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56" align="end">
							<DropdownMenu.Label class="font-normal">
								<div class="flex flex-col space-y-1">
									<p class="text-sm leading-none font-medium">{user.username}</p>
									<p class="text-muted-foreground text-xs leading-none">{user.email}</p>
								</div>
							</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Item onclick={() => goto('/user/@me')}>내 프로필</DropdownMenu.Item>
							</DropdownMenu.Group>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Item onclick={() => goto('/settings')}>설정</DropdownMenu.Item>
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

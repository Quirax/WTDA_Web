<script lang="ts">
	import * as LogoAvatar from '$lib/components/ui/avatar';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import UserAvatar from './Avatar.svelte';

	import './header.css';
	import { userStore } from '$lib/context';
	import { goto, onNavigate } from '$app/navigation';
	import { MessageSquare } from 'lucide-svelte';
	import { deserialize } from '$app/forms';
	import { onMount } from 'svelte';
	import { source } from 'sveltekit-sse';
	import Badge from '$lib/components/ui/badge/badge.svelte';

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

	let unreadCount = $state(0);

	const getUnreadCount = async () => {
		const result = await fetch('/dm?/getUnreadCount', { method: 'post', body: new FormData() })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			unreadCount = (result.data?.value as number | undefined) || 0;
		}
	};

	onMount(getUnreadCount);

	source('/sse')
		.select('dmSent')
		.subscribe((message) => {
			if (!message) return;
			getUnreadCount();
		});

	source('/sse')
		.select('dmRead')
		.subscribe((message) => {
			if (!message) return;
			getUnreadCount();
		});
</script>

<svelte:head>
	<title>{title === '뭐하지공방' ? '' : title + ' - '}뭐하지공방</title>
</svelte:head>

<header class="bg-background fixed top-0 left-0 z-10 w-full border-b-2">
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
					<!-- 메시지 목록 버튼 -->
					<Button variant="ghost" class="relative size-9 rounded-full p-0" href="/dm">
						<MessageSquare class="size-9" />
						{#if unreadCount > 0}
							<Badge
								class="absolute top-0 right-0 h-4 min-w-4 items-center justify-center rounded-full p-0">
								<span>{unreadCount}</span>
							</Badge>
						{/if}
					</Button>

					<!-- 사용자 드롭다운 메뉴 -->
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="m-0 p-0">
							{#snippet child({ props })}
								<Button
									{...props}
									variant="ghost"
									class="size-9 rounded-full p-0"
									aria-label="User Menu">
									<UserAvatar class="size-9" {user} withoutLink />
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
								<DropdownMenu.Item onclick={() => goto('/dm')}>메시지</DropdownMenu.Item>
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

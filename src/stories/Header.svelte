<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import './header.css';
	import logo from './assets/logo.png';
	import { fn } from '@storybook/test';

	interface Props {
		user?: { name: string };
		title?: string;
		onLogin?: () => void;
		onLogout?: () => void;
	}

	const { user, onLogin = fn(), onLogout = fn(), title = '뭐하지공방' }: Props = $props();
</script>

<header class="border-b">
	<div class="flex h-16 items-center px-4">
		<Avatar.Root class="bg-white p-1">
			<Avatar.Image src={logo} alt="뭐하지공방 로고" />
			<Avatar.Fallback>WA</Avatar.Fallback>
		</Avatar.Root>
		<div class="mx-6 flex items-center space-x-4 font-bold lg:space-x-6">{title}</div>
		<div class="ml-auto flex items-center space-x-4">
			<Input type="search" placeholder="검색..." class="h-9 md:w-[100px] lg:w-[300px]" />
			{#if user}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button
							variant="ghost"
							builders={[builder]}
							class="relative h-8 w-8 rounded-full"
							aria-label="User Menu"
						>
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
							<DropdownMenu.Item>알림</DropdownMenu.Item>
							<DropdownMenu.Item>대화</DropdownMenu.Item>
							<DropdownMenu.Item>설정</DropdownMenu.Item>
						</DropdownMenu.Group>
						<DropdownMenu.Separator />
						<DropdownMenu.Item on:click={onLogout}>로그아웃</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<Button class="h-8 w-[6em]" aria-label="Log in" on:click={onLogin}>로그인</Button>
				<Button class="h-8 w-[6em]" aria-label="Sign up">회원가입</Button>
			{/if}
		</div>
	</div>
</header>

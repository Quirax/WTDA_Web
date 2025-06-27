<script lang="ts">
	import SidebarLayout from '$stories/components/SidebarLayout.svelte';
	import type { Snippet } from 'svelte';

	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import HouseIcon from '@lucide/svelte/icons/house';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	// Menu items.
	const items = [
		{
			title: 'Home',
			url: '#',
			icon: HouseIcon,
		},
		{
			title: 'Inbox',
			url: '#',
			icon: InboxIcon,
		},
		{
			title: 'Calendar',
			url: '#',
			icon: CalendarIcon,
		},
		{
			title: 'Search',
			url: '#',
			icon: SearchIcon,
		},
		{
			title: 'Settings',
			url: '#',
			icon: SettingsIcon,
		},
	];

	let { children }: { children: Snippet } = $props();
</script>

<Sidebar.Provider class="min-h-full w-full">
	<SidebarLayout containerClass={undefined}>
		{#snippet nav()}
			<Sidebar.Root class="static w-full" collapsible="none">
				<Sidebar.Header />
				<Sidebar.Content class="h-full w-full">
					<Sidebar.Group>
						<Sidebar.GroupLabel>알파테스트</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive={page.route.id === '/admin/invitation'}>
										{#snippet child({ props })}
											<a href="/admin/invitation" {...props}>
												<span>초대코드 관리</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>
			</Sidebar.Root>
		{/snippet}
		{#snippet content()}
			{@render children()}
		{/snippet}
	</SidebarLayout>
</Sidebar.Provider>

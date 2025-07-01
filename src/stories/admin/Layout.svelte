<script lang="ts">
	import SidebarLayout from '$stories/components/SidebarLayout.svelte';
	import type { Snippet } from 'svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';

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

<svelte:options runes />

<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';

	import './MainPage.css';
	import Header from './Header.svelte';

	let user = $state<{ name: string }>();
	let userMode = $state<string>('requester');
</script>

<article>
	<Header
		{user}
		onLogin={() => (user = { name: 'Jane Doe' })}
		onLogout={() => (user = undefined)}
	/>

	<section id="search" class="flex h-[50vh] flex-col items-center justify-center space-y-10 p-6">
		<h1 class="text-center text-3xl font-bold tracking-tight break-keep">
			뭐하지공방에 오신 것을 환영합니다
		</h1>

		<Tabs.Root bind:value={userMode} class="w-[400px]">
			<Tabs.List class="grid w-full grid-cols-2">
				<Tabs.Trigger value="requester">저는 의뢰주입니다</Tabs.Trigger>
				<Tabs.Trigger value="comissioner">저는 커미션주입니다</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>

		<!-- placeholder="커미션 타입 또는 의뢰 찾기" -->
		<Input
			type="search"
			placeholder={userMode === 'requester' ? '커미션 타입 찾기' : '의뢰 찾기'}
			class="h-xl text-xl sm:w-full md:w-md"
		/>
	</section>

	<section id="recently-added" class="m-10">
		<h2 class="text-2xl font-bold tracking-tight break-keep">
			{#if userMode === 'requester'}
				새로 개장한 커미션 타입들입니다
			{:else}
				새로 지원을 기다리는 의뢰들입니다
			{/if}
		</h2>
		<!-- Card list of opened commission types -->
	</section>

	{#if userMode === 'requester'}
		<section id="suggestion" class="m-10">
			<h2 class="text-2xl font-bold tracking-tight break-keep">
				원하는 커미션 타입을 찾지 못하셨나요?
			</h2>
			<!-- Card list of opened commission types -->
		</section>
	{/if}

	<section id="introducing" class="relative my-10 flex justify-center px-17">
		<Carousel.Root class="align-center aspect-video max-h-[30vh] max-w-full" opts={{ loop: true }}>
			<Carousel.Previous />
			<Carousel.Content class="w-full">
				{#each Array(5) as _, i (i)}
					<Carousel.Item>
						<div class="aspect-video p-1">
							<Card.Root class="aspect-video">
								<Card.Content class="flex aspect-video items-center justify-center p-6">
									<span class="text-4xl font-semibold">
										<span class="hidden sm:inline">소개 또는 광고 </span>
										{i + 1}
									</span>
								</Card.Content>
							</Card.Root>
						</div>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			<Carousel.Next />
		</Carousel.Root>
	</section>
</article>

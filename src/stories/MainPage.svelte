<svelte:options runes />

<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import * as Avatar from '$lib/components/ui/avatar';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button';

	import './MainPage.css';
	import Header from './Header.svelte';

	import DocsImage from './assets/docs.png';

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

		<Tabs.Root bind:value={userMode} class="md:w-[400px]">
			<Tabs.List class="grid h-full! w-full md:grid-cols-2">
				<Tabs.Trigger value="requester">저는 의뢰주입니다</Tabs.Trigger>
				<Tabs.Trigger value="comissioner">저는 커미션주입니다</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>

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

		<section
			id="contents-list"
			class="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
		>
			{#each Array(15) as _, i (i)}
				<Card.Root>
					<img
						src={DocsImage}
						alt="{userMode === 'requester' ? '커미션' : '의뢰'} {i + 1}"
						class="aspect-video w-full object-cover"
					/>
					<Card.Header>
						<Card.Title>{userMode === 'requester' ? '커미션' : '의뢰'} {i + 1}</Card.Title>
						<Card.Description class="text-right"
							>by
							<Avatar.Root class="inline-block h-6 w-6 align-middle">
								<Avatar.Image src="/avatars/01.png" alt="@quiraxical" />
								<Avatar.Fallback>QR</Avatar.Fallback><!-- TODO: auto-generate fallback -->
							</Avatar.Root> Quirax Lee
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<Badge class="m-1">#그림</Badge>
						<Badge class="m-1" variant="secondary">#이런 태그</Badge>
						<Badge class="m-1" variant="secondary">#저런 태그</Badge>
						<Badge class="m-1" variant="secondary">#요런 태그</Badge>
					</Card.Content>
				</Card.Root>
			{/each}
		</section>
	</section>

	{#if userMode === 'requester'}
		<section id="suggestion" class="m-10 flex flex-col items-center justify-center space-y-8">
			<h2 class="text-2xl font-bold tracking-tight break-keep">
				원하는 커미션 타입을 찾지 못하셨나요?
			</h2>
			<Button class="p-6 text-xl">먼저 의뢰를 게시하세요!</Button>
			<div class="space-y-1 text-center">
				<p>의뢰를 찾는 작가님들이 여러분의 의뢰에 먼저 지원할 수 있습니다.</p>
				<p>물론 얼마든지 게시한 의뢰를 가지고 커미션을 직접 신청할 수도 있습니다.</p>
			</div>
		</section>
	{/if}

	<section id="introducing" class="relative mt-20 mb-10 flex justify-center px-17">
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

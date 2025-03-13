<svelte:options runes />

<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import * as Avatar from '$lib/components/ui/avatar';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button';

	import { H1, H2, P } from '$lib/components/typo';

	import { fn } from '@storybook/test';

	import './MainPage.css';

	import DocsImage from './assets/docs.png';
	import ProfileImage from './assets/profile_example.png';
	import Layout from './Layout.svelte';

	interface Props {
		user?: { name: string };
		onLogin?: () => void;
		onLogout?: () => void;
	}

	const enum UserMode {
		requester = 'requester',
		commisioner = 'commisioner',
	}

	const { user, onLogin = fn(), onLogout = fn() }: Props = $props();

	let userMode = $state<UserMode>(UserMode.requester);
</script>

<Layout {user} {onLogin} {onLogout}>
	<section
		id="search"
		class="bg-primary text-primary-foreground flex flex-col items-center justify-center space-y-10 p-20">
		<H1 class="text-center break-keep">뭐하지공방에 오신 것을 환영합니다</H1>

		<Tabs.Root bind:value={userMode} class="md:w-[400px]">
			<Tabs.List class="grid h-full! w-full md:grid-cols-2">
				<Tabs.Trigger value="requester">저는 의뢰주입니다</Tabs.Trigger>
				<Tabs.Trigger value="comissioner">저는 커미션주입니다</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>

		<form
			class="flex w-full max-w-sm flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2"
			onsubmit={(e) => {
				e.preventDefault();
			}}>
			<Input
				type="search"
				placeholder={userMode === UserMode.requester ? '커미션 타입 찾기' : '의뢰 찾기'}
				class="h-xl border-stone-200 bg-stone-50 text-xl text-stone-950 sm:w-full md:w-md" />
			<Button type="submit" variant="secondary">검색</Button>
		</form>
	</section>

	<section id="recently-added" class="m-10">
		<H2 class="break-keep">
			{#if userMode === UserMode.requester}
				새로 개장한 커미션 타입들입니다
			{:else}
				새로 지원을 기다리는 의뢰들입니다
			{/if}
		</H2>

		<section
			id="contents-list"
			class="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{#each Array(10) as _, i (i)}
				<Card.Root>
					<img
						src={DocsImage}
						alt="{userMode === UserMode.requester ? '커미션' : '의뢰'} {i + 1}"
						class="aspect-video w-full object-cover" />
					<Card.Header>
						<Card.Title>{userMode === UserMode.requester ? '커미션' : '의뢰'} {i + 1}</Card.Title>
						<Card.Description class="text-right">
							by
							<Avatar.Root class="inline-block h-6 w-6 align-middle">
								<Avatar.Image src={ProfileImage} alt="@quiraxical" />
								<Avatar.Fallback>QR</Avatar.Fallback>
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

	{#if userMode === UserMode.requester}
		<section
			id="suggestion"
			class="bg-accent text-accent-foreground my-10 flex flex-col items-center justify-center space-y-8 p-10 text-center">
			<H2 class="border-none break-keep">원하는 커미션 타입을 찾지 못하셨나요?</H2>
			<Button class="p-6 text-xl">먼저 의뢰를 게시하세요!</Button>
			<div class="space-y-0">
				<P>의뢰를 찾는 작가님들이 여러분의 의뢰에 먼저 지원할 수 있습니다.</P>
				<P>물론 얼마든지 게시한 의뢰를 가지고 커미션을 직접 신청할 수도 있습니다.</P>
			</div>
		</section>
	{/if}

	<section id="introducing" class="relative mt-20 mb-10 flex justify-center px-17">
		<Carousel.Root class="align-center aspect-video max-h-[50vh] max-w-full" opts={{ loop: true }}>
			<Carousel.Previous />
			<Carousel.Content class="w-full">
				{#each Array(5) as _, i (i)}
					<Carousel.Item>
						<div class="aspect-video p-1">
							<Card.Root class="aspect-video">
								<Card.Content class="flex aspect-video items-center justify-center p-6">
									<span class="text-4xl font-semibold">
										<span class="hidden sm:inline">소개 또는 광고</span>
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
</Layout>

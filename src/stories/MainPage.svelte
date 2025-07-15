<svelte:options runes />

<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button';

	import { H1, H2, P } from '$lib/components/typo';

	import Section from './components/Section.svelte';
	import Avatar from './components/Avatar.svelte';

	import './MainPage.css';
	import Header from './components/Header.svelte';
	import ArticleList from './components/ArticleList.svelte';
	import { ArticleType } from '@app';
	import { m } from '$lib/messages';

	interface Props {
		recentCommissionTypes?: App.CommisionType[];
		recentRequests?: App.Request[];
		introductions?: { src: string; alt: string }[];
	}

	type UserMode = 'requester' | 'commissioner';

	const { recentCommissionTypes = [], recentRequests = [], introductions = [] }: Props = $props();

	let userMode = $state<UserMode>('commissioner');
</script>

<Header title={m.SITE_NAME()} />

<section
	id="search"
	class="bg-primary text-primary-foreground banner-pattern flex flex-col items-center justify-center space-y-10 p-20 pt-36">
	<H1 class="text-center break-keep">{m['MAIN_PAGE.WELCOME']()}</H1>

	<!-- TODO 커미션 타입 관련 기능 추가 후 주석 해제
	<Tabs.Root bind:value={userMode} class="md:w-[400px]">
		<Tabs.List class="grid h-full! w-full md:grid-cols-2">
			<Tabs.Trigger value="requester">{m['MAIN_PAGE.TAB']({ userMode: 'requester' })}</Tabs.Trigger>
			<Tabs.Trigger value="comissioner">{m['MAIN_PAGE.TAB']({ userMode: 'comissioner' })}</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>
	-->

	<form
		class="flex w-full max-w-sm flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2"
		method="GET"
		action="/search">
		<input
			type="hidden"
			name="type"
			value={userMode === 'requester' ? ArticleType.COMMISSION : ArticleType.REQUEST} />
		<Input
			type="search"
			name="query"
			placeholder={m['MAIN_PAGE.SEARCH_PLACEHOLDER']({
				articleType:
					userMode === 'requester' ? m['ARTICLE_TYPE.COMMISSION']() : m['ARTICLE_TYPE.REQUEST'](),
			})}
			class="h-xl border-stone-200 bg-stone-50 text-xl text-stone-950 sm:w-full md:w-md" />
		<Button type="submit" variant="secondary">{m['SEARCH.BUTTON']()}</Button>
	</form>
</section>

{#if (userMode === 'requester' ? recentCommissionTypes : recentRequests).length > 0}
	<Section class="pt-10" id="recently-added">
		<H2 class="break-keep">
			{m['MAIN_PAGE.ARTICLE_LIST_TITLE']({ userMode: userMode })}
		</H2>

		<ArticleList
			id="contents-list"
			class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
			articles={userMode === 'requester' ? recentCommissionTypes : recentRequests}
			moreLink="https://192.169.0.3:5173/search?query=&type={userMode === 'requester'
				? 'COMMISSION'
				: 'REQUEST'}" />
	</Section>
{/if}

<!-- TODO 커미션 타입 관련 기능 추가 후 주석 해제
{#if userMode === 'requester'}
	<section
		id="suggestion"
		class="bg-accent text-accent-foreground my-10 flex flex-col items-center justify-center space-y-8 p-10 text-center">
		<H2 class="border-none break-keep">{m['MAIN_PAGE.SUGGESTION.SUBTITLE']()}</H2>
		<Button class="p-6 text-xl">{m['MAIN_PAGE.SUGGESTION.TITLE']()}</Button>
		<div class="space-y-0">
			{#each m['MAIN_PAGE.SUGGESTION.DESCRIPTION']().split("\n") as desc}
			<P>{desc}</P>
			{/each}
		</div>
	</section>
{/if}
-->

<!-- TODO 소개란 이미지 수정 기능 추가 후 주석 해제
{#if introductions.length > 0}
	<section id="introducing" class="relative mt-20 mb-10 flex justify-center px-17">
		<Carousel.Root class="align-center aspect-video max-h-[50vh] max-w-full" opts={{ loop: true }}>
			<Carousel.Previous />
			<Carousel.Content class="w-full">
				{#each introductions as intro}
					<Carousel.Item>
						<div class="aspect-video p-1">
							<Card.Root class="aspect-video">
								<img class="size-full" src={intro.src} alt={intro.alt} />
							</Card.Root>
						</div>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			<Carousel.Next />
		</Carousel.Root>
	</section>
{/if}
-->

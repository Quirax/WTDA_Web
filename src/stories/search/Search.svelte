<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { ArticleTypeText, CategoryText } from '$lib/messages';

	interface Props {
		query: string | undefined;
	}

	const { query }: Props = $props();
</script>

<Header title="'{query}' 검색결과" />

<Section>
	<H2>'{query}' 검색결과</H2>
	<nav class="my-2 flex flex-wrap space-y-2 space-x-2 border pt-2 pl-2">
		<Select.Root type="multiple" name="search_range">
			<!-- bind:value -->
			<Select.Trigger class="w-[10em]">
				{'검색 범위'}<!-- ArticleTypeText[$formData.type]() -->
			</Select.Trigger>
			<Select.Content>
				<Select.Item value={'title'}>제목</Select.Item>
				<Select.Item value={'content'}>내용</Select.Item>
				<Select.Item value={'tag'}>태그</Select.Item>
			</Select.Content>
		</Select.Root>

		<Select.Root type="single" name="type">
			<!-- bind:value -->
			<Select.Trigger class="w-[10em]">
				{'타입'}<!-- ArticleTypeText[$formData.type]() -->
			</Select.Trigger>
			<Select.Content>
				<Select.Item value={''}>모두</Select.Item>
				{#each Object.entries(ArticleTypeText) as [k, v]}
					<Select.Item value={k}>
						{v()}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<Select.Root type="single" name="category">
			<!-- bind:value -->
			<Select.Trigger class="w-[10em]">
				{'카테고리'}<!-- CategoryText[$formData.category]() -->
			</Select.Trigger>
			<Select.Content>
				<Select.Item value={''}>모두</Select.Item>
				{#each Object.entries(CategoryText) as [k, v]}
					<Select.Item value={k}>
						{v()}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<!-- 금액 범위: 별도 설정, 협의 가능 -->
		<!-- 일정 범위: 별도 설정, 협의 가능 -->

		<Select.Root type="single" name="commercial_use">
			<!-- bind:value -->
			<Select.Trigger class="w-[10em]">
				{'상업적 목적'}<!-- ArticleTypeText[$formData.type]() -->
			</Select.Trigger>
			<Select.Content>
				<Select.Item value={'all'}>모두</Select.Item>
				<Select.Item value={'excluded'}>제외</Select.Item>
				<Select.Item value={'required'}>필수</Select.Item>
			</Select.Content>
		</Select.Root>

		<Select.Root type="single" name="adult_contents">
			<!-- bind:value -->
			<Select.Trigger class="w-[10em]">
				{'성인 콘텐츠'}<!-- ArticleTypeText[$formData.type]() -->
			</Select.Trigger>
			<Select.Content>
				<Select.Item value={'all'}>모두</Select.Item>
				<Select.Item value={'excluded'}>제외</Select.Item>
				<Select.Item value={'required'}>필수</Select.Item>
			</Select.Content>
		</Select.Root>
	</nav>
	<section></section>
</Section>

<svelte:options runes />

<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel';

	import './MainPage.css';
	import Header from './Header.svelte';

	let user = $state<{ name: string }>();
</script>

<article>
	<Header
		{user}
		onLogin={() => (user = { name: 'Jane Doe' })}
		onLogout={() => (user = undefined)}
	/>

	<!-- Advertising Carousel -->
	<div class="relative flex justify-center px-17">
		<Carousel.Root class="align-center aspect-video max-h-[30vh] max-w-full" opts={{ loop: true }}>
			<Carousel.Previous />
			<Carousel.Content class="w-full">
				{#each Array(5) as _, i (i)}
					<Carousel.Item>
						<div class="aspect-video p-1">
							<Card.Root class="aspect-video">
								<Card.Content class="flex aspect-video items-center justify-center p-6">
									<span class="text-4xl font-semibold">소개 또는 광고 이미지 {i + 1}</span>
								</Card.Content>
							</Card.Root>
						</div>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			<Carousel.Next />
		</Carousel.Root>
	</div>

	<!-- Card list of opened commission types -->
	<!-- Card list of opened requests -->
</article>

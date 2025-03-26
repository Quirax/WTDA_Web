<svelte:options runes />

<script lang="ts">
	import H1 from '$lib/components/typo/h1.svelte';
	import H2 from '$lib/components/typo/h2.svelte';
	import P from '$lib/components/typo/p.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { layoutStore } from '$lib/context';

	interface Props {
		username: string;
	}

	const { username = '' }: Props = $props();

	$effect.pre(() => {
		layoutStore.update((value) => {
			const newValue = { ...value };

			newValue.title = '환영합니다!';
			newValue.showSearchPanel = false;
			newValue.showUserPanel = false;

			return newValue;
		});
	});
</script>

<section
	id="search"
	class="bg-primary text-primary-foreground flex flex-col items-center justify-center space-y-10 bg-[url(/background-pattern-banner.png)] p-20">
	<H2 class="mb-0 text-center border-none break-keep">{username} 님!</H2>
	<H1 class="text-center break-keep">뭐하지공방에 오신 것을 환영합니다</H1>
</section>
<div class="m-6 space-y-4 text-lg text-center">
	<P>이제 로그인하여 뭐하지공방의 모든 서비스를 이용해보세요!</P>
	<Button href="/login" class="text-lg">로그인</Button>
</div>

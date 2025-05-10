<script lang="ts">
	import { ErrorCode } from '@app';
	import { DefaultDescriber, type DescriberProps } from './describer';
	import type { Snippet } from 'svelte';
	import Header from '$stories/components/Header.svelte';
	import H2 from '$lib/components/typo/h2.svelte';
	import Section from '$stories/components/Section.svelte';
	import P from '$lib/components/typo/p.svelte';
	import Ul from '$lib/components/typo/ul.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { page } from '$app/state';

	const { error }: DescriberProps = $props();

	let snippet = $state<Snippet>();
	let title = $state('HTTP 451');

	switch (error.code) {
		case ErrorCode.ADULT_RESTRICTED:
			snippet = ADULT_RESTRICTED;
			title = '성인인증 안내';
			break;
	}
</script>

<svelte:head>
	{#if error.code === ErrorCode.ADULT_RESTRICTED}
		<!-- 「청소년 유해매체물의 표시방법」(방송통신위원회고시 제2015-17호)에 따른 전자적 표시 -->
		{/* @ts-ignore */ null}
		<!-- prettier-ignore -->
		<meta http-equiv="PICS-label" content='(PICS-1.1 "http://service.kosec.or.kr/rating.html" l gen false for "{page.url}" r (y 1))' />
	{/if}
</svelte:head>

{#snippet ADULT_RESTRICTED()}
	<H2>이 콘텐츠는 성인인 회원만 볼 수 있습니다</H2>
	<div class="mt-4 flex items-center space-x-2">
		<div
			class="flex h-[3rem] w-[3rem] flex-none items-center justify-center rounded-full border-4 border-red-600 text-[1.5rem] font-bold">
			19
		</div>
		<P class="m-0!">
			이 정보내용은 청소년유해매체물로서 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 및
			「청소년 보호법」에 따라 19세 미만의 청소년이 이용할 수 없습니다.
		</P>
	</div>
	<Ul>
		<li>
			현재 <Button variant="link" href="/login" class="text-primary! text-[size:inherit]">
				로그인
			</Button>이 되어 있는지 확인하십시오.
		</li>
		<li>
			<Button variant="link" href="/settings/info" class="text-primary! text-[size:inherit]">
				사용자 설정
			</Button>에서 본인인증이 되어 있는지 확인하십시오.
		</li>
		<li>
			미성년자는 본인인증이 되어 있더라도 위 규정에 따라 이 콘텐츠를 볼 수 없습니다. 이 점 양해
			부탁드립니다.
		</li>
	</Ul>
	<P class="text-muted-foreground text-sm">
		이 페이지는 <Button
			variant="link"
			href="https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%A0%95%EB%B3%B4%ED%86%B5%EC%8B%A0%EB%A7%9D%EC%9D%B4%EC%9A%A9%EC%B4%89%EC%A7%84%EB%B0%8F%EC%A0%95%EB%B3%B4%EB%B3%B4%ED%98%B8%EB%93%B1%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0">
			「정보통신망 이용촉진 및 정보보호 등에 관한 법률」
		</Button> 및 <Button
			variant="link"
			href="https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%B2%AD%EC%86%8C%EB%85%84%EB%B3%B4%ED%98%B8%EB%B2%95">
			「청소년 보호법」
		</Button>, <Button
			variant="link"
			href="https://www.law.go.kr/LSW//admRulInfoP.do?admRulSeq=2100000024097">
			「청소년 유해매체물의 표시방법」
		</Button>(방송통신위원회고시 제2015-17호)에 따라 작성되었습니다.
	</P>
{/snippet}

{#if snippet}
	<Header {title} />
	<Section>
		{@render snippet()}
	</Section>
{:else}
	<DefaultDescriber {error} status={451} />
{/if}

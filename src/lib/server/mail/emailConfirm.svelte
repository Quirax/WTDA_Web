<svelte:options runes />

<script lang="ts">
	import Code from '$lib/components/typo/code.svelte';
	import H2 from '$lib/components/typo/h2.svelte';
	import P from '$lib/components/typo/p.svelte';
	import type { HTMLSlotAttributes } from 'svelte/elements';
	import Section from '../../../stories/components/Section.svelte';
	import Template from './template.svelte';

	export interface Props {
		confirmCode: string;
	}

	const { confirmCode = 'XXXXX-XXXXX' }: Props = $props();
</script>

<Template>
	<Section>
		<H2>이메일 인증 코드</H2>
		<P>아래의 인증 코드를 인증 페이지에 입력하세요.</P>
		<div class="m-4">
			<Code class="bg-secondary border text-2xl">{confirmCode}</Code>
		</div>
		<P class="text-sm">
			만약 뭐하지공방에 가입을 시도한 적이 없다면, 고객센터를 통해 신고해주세요.
		</P>
	</Section>
</Template>

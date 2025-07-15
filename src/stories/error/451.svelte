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
	import { m } from '$lib/messages';
	import { replace } from '$lib/utils.svelte';

	const { error }: DescriberProps = $props();

	let snippet = $state<Snippet>();
	let title = $state('');

	switch (error.code) {
		case ErrorCode.ADULT_RESTRICTED:
			snippet = ADULT_RESTRICTED;
			title = m['HTTP_ERROR.451.ADULT_RESTRICTED.TITLE']();
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
	{#snippet instructionLink(href: string, text: string)}
		<Button variant="link" {href} class="text-primary! text-[size:inherit]">{text}</Button>
	{/snippet}
	{#snippet statementLink(href: string, text: string)}
		<Button variant="link" {href}>{text}</Button>
	{/snippet}
	<H2>{m['HTTP_ERROR.451.ADULT_RESTRICTED.HEADING']()}</H2>
	<div class="mt-4 flex items-center space-x-2">
		<div
			class="flex h-[3rem] w-[3rem] flex-none items-center justify-center rounded-full border-4 border-red-600 text-[1.5rem] font-bold">
			19
		</div>
		<P class="m-0!">{m['HTTP_ERROR.451.ADULT_RESTRICTED.RESTRICTED']()}</P>
	</div>
	<Ul>
		<li>
			{@render replace.link(
				m['HTTP_ERROR.451.ADULT_RESTRICTED.INSTRUCTION_LOGIN'](),
				instructionLink,
			)}
		</li>
		<li>
			{@render replace.link(
				m['HTTP_ERROR.451.ADULT_RESTRICTED.INSTRUCTION_AUTHENTICATION'](),
				instructionLink,
			)}
		</li>
		<li>{m['HTTP_ERROR.451.ADULT_RESTRICTED.INSTRUCTION_NON_ADULT']()}</li>
	</Ul>
	<P class="text-muted-foreground text-sm">
		{@render replace.link(m['HTTP_ERROR.451.ADULT_RESTRICTED.LEGAL_STATEMENT'](), statementLink)}
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

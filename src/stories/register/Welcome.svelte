<svelte:options runes />

<script lang="ts">
	import H1 from '$lib/components/typo/h1.svelte';
	import H2 from '$lib/components/typo/h2.svelte';
	import P from '$lib/components/typo/p.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { m } from '$lib/messages';
	import Header from '$stories/components/Header.svelte';

	interface Props {
		username: string;
	}

	const { username = '' }: Props = $props();
</script>

<Header title={m['WELCOME.TITLE']()} />

<section
	id="search"
	class="bg-primary text-primary-foreground flex flex-col items-center justify-center space-y-10 p-20">
	<H2 class="mb-0 border-none text-center break-keep">{m['WELCOME.SHOUTOUT']({ username })}</H2>
	<H1 class="text-center break-keep">{m['WELCOME.WELCOME']()}</H1>
</section>
<div class="m-6 space-y-4 text-center text-lg">
	<P>{m['WELCOME.SUGGESTION']()}</P>
	<Button href="/login" class="text-lg">{m['LOGIN']()}</Button>
</div>

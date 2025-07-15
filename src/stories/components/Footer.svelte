<svelte:options runes />

<script lang="ts">
	import { SIIcon } from '@willingtonortiz/svelte-simple-icons';

	import { footerInfo, isLink } from '$lib/config';

	import './Footer.css';
	import { replace } from '$lib/utils.svelte';
	import { m } from '$lib/messages';

	const anchorProps = {
		class: 'hover:text-primary font-medium mb-1',
	};

	const iconProps = {
		class: 'size-[1em]',
		color: 'currentColor',
	};
</script>

{#snippet link(href: string, token: string)}
	{@const [target, text] = token.split('\u0002')}
	<a {href} {target} {...anchorProps}>{text}</a>
{/snippet}

<!-- ref: https://stackoverflow.com/a/72232241 -->
<footer
	class="sticky top-[100vh] bg-stone-400 p-10 text-sm text-stone-800 dark:bg-stone-800 dark:text-stone-400">
	<div class="flex flex-wrap items-center space-x-4 text-base leading-7 [&:not(:first-child)]:mt-6">
		{#each footerInfo.links as link}
			<a href={link.href} target={link.target} {...anchorProps}>{link.text}</a>
		{/each}
		<div class="inline-flex flex-nowrap space-x-4">
			{#each footerInfo.sns as link}
				<a href={link.href} target={link.target} {...anchorProps}>
					<SIIcon icon={link.icon} {...iconProps} title={link.text} />
				</a>
			{/each}
		</div>
	</div>
	<div class="flex flex-wrap items-center space-y-1 space-x-4 leading-7 [&:not(:first-child)]:mt-6">
		{#each footerInfo.info as info}
			{#if isLink(info.info)}
				<span>
					{info.subject}:
					<a href={info.info.href} target={info.info.target} {...anchorProps}>{info.info.text}</a>
				</span>
			{:else}
				<span>{info.subject}: {info.info}</span>
			{/if}
		{/each}
	</div>
	<div class=" leading-7 [&:not(:first-child)]:mt-6">
		{@render replace.link(
			m['USED_DESIGN_BY']({
				usedDesignBy: footerInfo.usedDesignBy
					.map((by) => `\u0000${by.href}\u0001${by.target}\u0002${by.text}\u0000`)
					.join(', '),
			}),
			link,
		)}
	</div>
	<div class=" leading-7 [&:not(:first-child)]:mt-6">
		{footerInfo.disclaimar}
	</div>
</footer>

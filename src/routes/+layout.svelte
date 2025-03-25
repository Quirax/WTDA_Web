<script lang="ts">
	import '../app.css';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import type { LayoutServerData } from './$types';
	import { sessionContext, userContext } from '$lib/context';

	interface Props extends ReturnType<typeof $props> {
		data: LayoutServerData;
	}

	let { children, data }: Props = $props();

	userContext.v = data.user;
	sessionContext.v = data.session;
</script>

<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>

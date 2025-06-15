<script lang="ts">
	import Chat from '$stories/dm/Chat.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Chat />

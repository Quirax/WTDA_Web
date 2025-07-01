<script lang="ts">
	import Invitation from '$stories/admin/Invitation.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Invitation />

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Error from '$stories/error/Error.svelte';

	let error: NonNullable<typeof page.error>;

	if (!page.error) goto('/');
	else error = page.error;
</script>

<Error status={page.status} {error} />

<script lang="ts">
	import type { Component } from 'svelte';
	import * as DescriberDict from './describer';

	interface Props {
		error: App.Error;
		status: number;
	}

	const { error, status }: Props = $props();

	let Describer = $state<Component<any>>();

	switch (status) {
		case 451:
			Describer = DescriberDict._451;
			break;
		default:
			Describer = DescriberDict.DefaultDescriber;
	}
</script>

<Describer {error} {status} />

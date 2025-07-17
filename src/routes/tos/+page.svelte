<script lang="ts">
	import tos from '$lib/assets/tos.md';
	import { m } from '$lib/messages';
	import RegulationView from '$stories/RegulationView.svelte';
</script>

<RegulationView src={tos} title={m['TOS']()} />

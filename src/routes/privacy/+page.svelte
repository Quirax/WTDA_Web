<script lang="ts">
	import privacy from '$lib/assets/privacy.md';
	import { m } from '$lib/messages';
	import RegulationView from '$stories/RegulationView.svelte';
</script>

<RegulationView src={privacy} title={m['PRIVACY_POLICY']()} />

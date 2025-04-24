<script lang="ts">
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';

	interface Props extends ReturnType<typeof $props> {
		article: App.Request;
	}

	const { article }: Props = $props();
</script>

<Header title={article.title} />

<Section></Section>

<script lang="ts">
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';

	interface Props {
		query: string | undefined;
	}

	const { query }: Props = $props();
</script>

<Header title="'{query}' 검색결과" />

<Section>
	<nav>
		<!-- 검색 기본 조건 -->
	</nav>
	<section>
		<!-- 검색 결과 목록 -->
	</section>
</Section>

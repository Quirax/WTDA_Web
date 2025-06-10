<script lang="ts">
	interface Props extends ReturnType<typeof $props> {}

	const { children }: Props = $props();
</script>

{@render children()}

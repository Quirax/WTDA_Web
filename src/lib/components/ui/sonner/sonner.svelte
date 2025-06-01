<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner';
	import { mode } from 'mode-watcher';

	let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
	theme={mode.current}
	class="toaster group"
	style="--normal-bg: hsl(var(--popover)); --normal-text: hsl(var(--popover-foreground)); --normal-border: hsl(var(--border));"
	{...restProps} />

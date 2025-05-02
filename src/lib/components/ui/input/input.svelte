<script lang="ts">
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	type InputType = Exclude<HTMLInputTypeAttribute, 'file'>;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, 'type'> &
			(
				| { type: 'file'; files?: FileList; nullable?: undefined }
				| { type?: InputType; files?: undefined; nullable?: undefined }
				| { type: 'currency'; nullable?: boolean; files?: undefined }
			)
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		...restProps
	}: Props = $props();
</script>

{#if type === 'file'}
	<input
		bind:this={ref}
		class={cn(
			'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
			className,
		)}
		type="file"
		bind:files
		bind:value
		{...restProps} />
{:else if type === 'currency'}
	<!-- ref: https://codepen.io/559wade/pen/LRzEjj -->
	{@const { onkeyup, 'on:keyup': _onkeyup, nullable = false, ...otherProps } = restProps}
	<input
		bind:this={ref}
		class={cn(
			'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
			className,
		)}
		type="text"
		value={typeof value === 'number' ? new Intl.NumberFormat('ko-KR').format(value) : ''}
		onkeyup={(event) => {
			const t = event.currentTarget;
			const v = t.value;

			let original_len = v.length;
			let caret_pos = t.selectionStart;

			if (nullable && v === '') {
				value = null;
			} else {
				t.value = new Intl.NumberFormat('ko-KR').format(
					(value = parseInt(v.replace(/\D/g, '').padStart(1, '0'))),
				);
			}

			let updated_len = t.value.length;

			if (caret_pos) {
				caret_pos += updated_len - original_len;
				t.setSelectionRange(caret_pos, caret_pos);
			}

			onkeyup && onkeyup(event);
			_onkeyup && _onkeyup(event);
		}}
		{...otherProps} />
{:else}
	<input
		bind:this={ref}
		class={cn(
			'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
			className,
		)}
		{type}
		bind:value
		{...restProps} />
{/if}

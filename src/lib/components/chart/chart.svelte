<svelte:options runes />

<script lang="ts">
	import * as echarts from 'echarts';
	import type { Action } from 'svelte/action';
	type EChartsOption = echarts.EChartsOption;

	interface Props extends ReturnType<typeof $props> {
		option?: EChartsOption;
		series: echarts.SeriesOption[];
	}

	const { option, series, ...restProps }: Props = $props();

	// ref: https://svelte.dev/docs/svelte/use
	const drawChart: Action = (container) => {
		$effect(() => {
			let chart = echarts.init(container);
			let concludedOption: EChartsOption;

			concludedOption = {
				...option,
				series,
			};

			concludedOption && chart.setOption(concludedOption);

			return () => {
				chart.dispose();
			};
		});
	};
</script>

<div {...restProps} use:drawChart></div>

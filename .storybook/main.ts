import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts|svelte)'],
	addons: [
		'@storybook/addon-essentials',
		'@storybook/addon-svelte-csf',
		'@chromatic-com/storybook',
		'@storybook/addon-themes',
	],
	framework: {
		name: '@storybook/sveltekit',
		options: {},
	},
	typescript: {
		check: false,
	},
	staticDirs: ['../static'],
};
export default config;

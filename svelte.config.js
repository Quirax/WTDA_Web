import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess({ script: true }),

	kit: {
		adapter: adapter(),
		alias: { $stories: 'src/stories', '@app': 'src/app.ts' },
	},
};

export default config;

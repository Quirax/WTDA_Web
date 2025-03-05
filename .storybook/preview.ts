import type { Preview } from '@storybook/svelte';
import { withThemeByClassName } from '@storybook/addon-themes';
import '../src/app.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		}
	}
};

export default preview;

export const decorators = [
	withThemeByClassName({
		themes: {
			light: 'light',
			dark: 'dark'
		},
		defaultTheme: 'light'
	})
];

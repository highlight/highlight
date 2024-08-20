import type { StorybookConfig } from '@storybook/react-vite'
import { dirname, join } from 'path'

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
	addons: [
		getAbsolutePath('@storybook/addon-essentials'),
		getAbsolutePath('@storybook/addon-interactions'),
		getAbsolutePath('@storybook/addon-links'),
	],
	core: {
		builder: getAbsolutePath('@storybook/builder-vite'),
	},
	framework: getAbsolutePath('@storybook/react-vite'),
	docs: {},
}

export default config

function getAbsolutePath(value: string): any {
	return dirname(require.resolve(join(value, 'package.json')))
}

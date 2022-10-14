const { mergeConfig } = require('vite')

module.exports = {
	stories: ['../src/**/*.stories.*'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
	],
	framework: '@storybook/react',
	core: {
		builder: '@storybook/builder-vite',
	},
	features: {
		storyStoreV7: true,
	},
	async viteFinal(config) {
		return mergeConfig(config, {
			plugins: [
				require('@vanilla-extract/vite-plugin').vanillaExtractPlugin(),
			],
		})
	},
}

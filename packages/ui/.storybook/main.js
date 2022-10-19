const { mergeConfig } = require('vite')

module.exports = {
	stories: ['../src/**/*.stories.tsx'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
		'@storybook/preset-typescript',
	],
	framework: '@storybook/react',
	core: {
		builder: '@storybook/builder-vite',
	},
	features: {
		storyStoreV7: true,
	},
	typescript: {
		reactDocgenTypescriptOptions: {
			shouldExtractLiteralValuesFromEnum: true,
			shouldExtractValuesFromUnion: true,
		},
	},

	async viteFinal(config) {
		return mergeConfig(config, {
			plugins: [
				require('@vanilla-extract/vite-plugin').vanillaExtractPlugin(),
			],
		})
	},
}

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import unusedImports from 'eslint-plugin-unused-imports'
import _import from 'eslint-plugin-import'
import tailwindcss from 'eslint-plugin-tailwindcss'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import reactRefresh from 'eslint-plugin-react-refresh'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
})

export default [
	{
		ignores: [
			'src/graph/generated/*',
			'src/__generated/*',
			'src/components/Search/Parser/antlr/*',
		],
	},
	...fixupConfigRules(
		compat.extends(
			'plugin:react/recommended',
			'plugin:@typescript-eslint/recommended',
			'plugin:prettier/recommended',
			'plugin:react-hooks/recommended',
			'plugin:tailwindcss/recommended',
		),
	),
	reactRefresh.configs.recommended,
	{
		plugins: {
			'unused-imports': unusedImports,
			import: fixupPluginRules(_import),
			tailwindcss: fixupPluginRules(tailwindcss),
		},

		languageOptions: {
			globals: {
				...globals.commonjs,
				...globals.node,
			},

			parser: tsParser,
			ecmaVersion: 2020,
			sourceType: 'module',

			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},

		settings: {
			react: {
				version: 'detect',
			},
		},

		rules: {
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/ban-types': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'import/no-extraneous-dependencies': 'error',
			'react-hooks/exhaustive-deps': 'error',
			'react/display-name': 'off',
			'react/no-unescaped-entities': 'off',
			'react/prop-types': 'off',
			'react/react-in-jsx-scope': 'off',
			'tailwindcss/no-custom-classname': 'off',
			'unused-imports/no-unused-imports': 'error',

			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],

			'react/jsx-curly-brace-presence': [
				'error',
				{
					props: 'never',
					children: 'never',
				},
			],

			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'react-highlight-words',
							message:
								'Please use TextHighlighter from /src/components/TextHighlighter instead.',
						},
						{
							name: 'antd',
							importNames: ['Popover'],
							message:
								'Please use Popover from /src/components/Popover instead.',
						},
						{
							name: 'antd',
							importNames: ['Modal'],
							message:
								'Please use Modal from /src/components/Modal instead.',
						},
						{
							name: 'antd',
							importNames: ['Tooltip'],
							message:
								'Please use Tooltip from /src/components/Tooltip instead.',
						},
						{
							name: 'antd',
							importNames: ['Tabs'],
							message:
								'Please use Tabs from @highlight-run/ui/components instead.',
						},
						{
							name: 'antd',
							importNames: ['Progress'],
							message:
								'Please use Progress from /src/components/Progress instead.',
						},
						{
							name: 'antd',
							importNames: ['Switch'],
							message:
								'Please use Switch from /src/components/Switch instead.',
						},
						{
							name: 'antd',
							importNames: ['Popconfirm'],
							message:
								'Please use PopConfirm from /src/components/PopConfirm instead.',
						},
						{
							name: 'antd',
							importNames: ['Select'],
							message:
								'Please use Select from /src/components/Select instead.',
						},
						{
							name: 'antd',
							importNames: ['InputNumber'],
							message:
								"Please use Form.Input with type='number' from @highlight-run/ui/components instead.",
						},
						{
							name: 'react-router',
							message: 'Please use `react-router-dom` instead.',
						},
						{
							name: 'react-router-dom',
							importNames: ['useParams'],
							message:
								'Please use useParams from @util/react-router/useParams instead.',
						},
						{
							name: 'react-json-view',
							importNames: ['ReactJson'],
							message:
								'Please use JsonViewer from @components/JsonViewer instead.',
						},
						{
							name: '@highlight-run/ui',
							importNames: ['Button'],
							message:
								'Please use Button from @components/Button instead.',
						},
						{
							name: 'react-use',
							importNames: ['useLocalStorage'],
							message:
								'Please use @rehooks/local-storage instead.',
						},
						{
							name: 'antd',
							importNames: ['message'],
							message:
								'Please use the toast function from @components/Toaster instead.',
						},
					],

					patterns: [
						{
							group: ['**/*/$'],
							message: 'Import without the trailing / instead.',
						},
						{
							group: ['**/packages/ui/src'],
							message: 'Import from @highlight-run/ui instead.',
						},
					],
				},
			],
		},
	},
]

import path from 'path'
import fs from 'fs-extra'
import { globby } from 'globby'
import cheerio from 'cheerio'
import { pascalCase } from 'change-case'
import { optimize } from 'svgo'
import { transform, Config } from '@svgr/core'

const componentTemplate: Config['template'] = (variables, { tpl }) => {
	return tpl`
import React from 'react'
import { IconProps } from './types'
${`\n`}
export const ${
		variables.componentName
	} = ({ size = '1em', ...props }: IconProps) => {
	return ${variables.jsx}
}
`
}

const VALID_COLORS = ['currentColor', 'none']
const COLOR_ATTRS = ['stroke', 'fill']

const updateAttrs = ($el) => {
	COLOR_ATTRS.forEach((attr) => {
		const color = $el.attr(attr)

		if (color && !VALID_COLORS.includes(color)) {
			$el.attr(attr, 'currentColor')
		}
	})
}

const svgrConfig: Config = {
	svgProps: {
		focusable: 'false',
		width: '{size}',
		height: '{size}',
	},
	icon: true,
	template: componentTemplate,
	typescript: true,
	plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
}

const baseDir = new URL('..', import.meta.url).pathname
const iconComponentsDir = path.join(baseDir, 'src/components/icons')

;(async () => {
	// Clean up existing SVG components
	const existingComponentPaths = await globby(
		path.join(iconComponentsDir, '**/*.tsx'),
		{
			cwd: baseDir,
			absolute: true,
		},
	)
	await Promise.all(
		existingComponentPaths.map(async (existingComponentPath) => {
			await fs.remove(existingComponentPath)
		}),
	)

	// Load SVGs
	const svgFilePaths = await globby('src/icons/**/*.svg', {
		cwd: baseDir,
	})

	await Promise.all(
		svgFilePaths.map(async (svgFilePath) => {
			const svgName = path.basename(svgFilePath, '.svg')
			const iconVariant = svgFilePath.split('/')[2]
			const svg = await fs.readFile(svgFilePath, 'utf-8')

			// Run through SVGO to optimize
			let optimisedSvg = optimize(svg, {
				multipass: true,
				plugins: [
					{
						name: 'preset-default',
						params: {
							overrides: {
								removeViewBox: false,
							},
						},
					},
					{
						name: 'inlineStyles',
						params: {
							onlyMatchedOnce: false,
						},
					},
					{ name: 'convertStyleToAttrs' },
				],
			}).data

			// Replace stroke and fill attributes with 'currentColor'
			const $ = cheerio.load(optimisedSvg)
			const $svg = $('svg')
			updateAttrs($svg)
			$svg.find('*').each((i, el) => {
				updateAttrs($(el))
			})

			optimisedSvg = $.html($svg) || ''

			const iconName = `Icon${pascalCase(iconVariant)}${pascalCase(
				svgName,
			)}`
			const svgComponent = await transform(optimisedSvg, svgrConfig, {
				componentName: iconName,
			})

			// Write SVG React component
			await fs.writeFile(
				path.join(iconComponentsDir, `${iconName}.tsx`),
				svgComponent,
				{ encoding: 'utf-8' },
			)
		}),
	)

	// Create icons/index.ts
	const iconComponentNames = (await fs.readdir(iconComponentsDir)).filter(
		(fileOrDir) => fileOrDir.includes('Icon'),
	)
	let iconExports = iconComponentNames
		.map((componentFile) => path.basename(componentFile, '.tsx'))
		.map((component) => `export { ${component} } from './${component}'`)
		.join('\n')
		.concat('\n')
	const iconsIndexPath = path.join(iconComponentsDir, 'index.ts')
	iconExports += "export type { IconProps } from './types'\n"

	await fs.writeFile(iconsIndexPath, iconExports, 'utf-8')
})()

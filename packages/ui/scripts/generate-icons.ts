import path from 'path'
import fs from 'fs-extra'
import { globby } from 'globby'
import cheerio from 'cheerio'
import { pascalCase } from 'change-case'
import dedent from 'dedent'
import { optimize } from 'svgo'
import { transform, Config } from '@svgr/core'

// interface TemplateVariables {
//   componentName: string;
//   interfaces: types.TSInterfaceDeclaration[];
//   props: (types.ObjectPattern | types.Identifier)[];
//   imports: types.ImportDeclaration[];
//   exports: (types.VariableDeclaration | types.ExportDeclaration | types.Statement)[];
//   jsx: types.JSXElement;
// }
// interface TemplateContext {
//   options: Options;
//   tpl: TemplateBuilder<types.Statement | types.Statement[]>['ast'];
// }
// (variables: TemplateVariables, context: TemplateContext): types.Statement | types.Statement[];
const componentTemplate = (variables, { tpl }) => {
	return tpl`
${variables.imports};

${variables.interfaces};

export const ${variables.componentName} = (${variables.props}) => (
  ${variables.jsx}
);
`
}

const svgrConfig: Config = {
	svgProps: {
		focusable: 'false',
		fill: 'currentColor',
		width: '16',
		height: '16',
	},
	replaceAttrValues: {
		'#000': 'currentColor',
	},
	template: componentTemplate,
	plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
}

const baseDir = new URL('..', import.meta.url).pathname
const iconComponentsDir = path.join(baseDir, 'src/components/icons')
console.log('baseDir', baseDir)
console.log('iconComponentsDir', iconComponentsDir)
;(async () => {
	// First clean up any existing SVG components
	const existingComponentPaths = await globby(
		path.join(iconComponentsDir, '*/*Svg.tsx'),
		{
			cwd: baseDir,
			absolute: true,
		},
	)
	console.log('existingComponentPaths', existingComponentPaths)
	await Promise.all(
		existingComponentPaths.map(async (existingComponentPath) => {
			await fs.remove(existingComponentPath)
		}),
	)

	// Load SVGs
	const svgFilePaths = await globby('src/icons/**/*.svg', {
		cwd: baseDir,
	})
	console.log('svgFilePaths', svgFilePaths)

	await Promise.all(
		svgFilePaths.map(async (svgFilePath) => {
			// Split out the icon variants (e.g. bookmark-active.svg)
			const [svgName, variantName] = path
				.basename(svgFilePath, '.svg')
				.split('-')

			const rawSvg = await fs.readFile(svgFilePath, 'utf-8')
			const svg = rawSvg.replace(/ data-name=".*?"/g, '')

			// Run through SVGO
			const optimisedSvg = optimize(svg, {
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

			// TODO: Figure out how to update all the fill/stroke/etc. w/ currentColor
			// Validate SVG before import
			// const $ = cheerio.load(optimisedSvg)
			// $('svg *').each((i, el) => {
			// 	const $el = $(el)

			// 	// Validate color attributes
			// 	;['stroke', 'fill'].forEach((attr) => {
			// 		const color = $el.attr(attr)
			// 		const validColors = ['currentColor', 'none', '#000']
			// 		if (color && !validColors.includes(color)) {
			// 			throw new Error(
			// 				`${svgName}: Invalid ${attr} color: ${$.html(el)}`,
			// 			)
			// 		}
			// 	})
			// })

			const iconName = `Icon${pascalCase(svgName)}`
			const svgComponentName = `${iconName}${
				variantName ? pascalCase(variantName) : ''
			}Svg`
			console.log('iconName', iconName)
			console.log('svgComponentName', svgComponentName)
			const svgComponent = await transform(optimisedSvg, svgrConfig, {
				componentName: svgComponentName,
			})

			// Write SVG React component
			await fs.writeFile(
				path.join(iconComponentsDir, `${svgComponentName}.tsx`),
				svgComponent,
				{ encoding: 'utf-8' },
			)

			// Bail out early if we're processing an icon variant (e.g. bookmark-active.svg)
			// All subsequent steps should only happen once per icon component.
			if (variantName) {
				return
			}
		}),
	)

	// Create icons/index.ts
	const iconComponentNames = (await fs.readdir(iconComponentsDir)).filter(
		// Only include directories that contain an icon, e.g. exclude '__snapshots__'
		(fileOrDir) => !fileOrDir.includes('.') && fileOrDir.includes('Icon'),
	)
	console.log('::: iconComponentNames', iconComponentNames)
	const iconExports = iconComponentNames
		.map((componentFile) => path.basename(componentFile, '.tsx'))
		.map(
			(component) =>
				`export { ${component} } from './${component}/${component}';`,
		)
		.join('\n')
		.concat('\n')
	const iconsIndexPath = path.join(iconComponentsDir, 'index.ts')
	await fs.writeFile(iconsIndexPath, iconExports, 'utf-8')
})()

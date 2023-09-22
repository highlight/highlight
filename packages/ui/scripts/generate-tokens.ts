import { readFile, writeFileSync } from 'node:fs'
import { exec } from 'child_process'
import camelCase from 'lodash.camelcase'

const inputFile = new URL('../design-tokens.json', import.meta.url).pathname
const outputColorsFile = new URL('../src/css/colors.ts', import.meta.url)
	.pathname
const outputThemeFile = new URL('../src/css/theme.css.ts', import.meta.url)
	.pathname
const colorTokens = { inherit: 'inherit' }
const lightThemeTokens = {}

readFile(inputFile, 'utf8', (err, data) => {
	if (err) {
		throw err
	}

	const json = JSON.parse(data)

	extractColors(json.Primitives)
	extractThemeVariables(json['Light theme'], lightThemeTokens)

	const theme = objectKeysToCamelCase(lightThemeTokens)
	let themeContent = `import { createGlobalTheme } from '@vanilla-extract/css'\n\n`
	themeContent += `export const themeVars = createGlobalTheme('.highlight-light-theme', ${JSON.stringify(
		theme,
	)})`

	const colors = objectKeysToCamelCase(colorTokens)
	const textColors = valuesStartingWith(colors, {
		'static.content.': 'static.content.',
	})
	const backgroundColors = valuesStartingWith(colors, {
		'static.surface.': 'static.',
		'interactive.fill.': 'interactive.',
		'interactive.overlay.': 'interactive.',
	})
	const borderColors = valuesStartingWith(colors, {
		'interactive.outline.': 'interactive.outline.',
	})
	let colorsContent = `export const colors = ${JSON.stringify(colors)}\n\n`
	colorsContent += `export const textColors = ${JSON.stringify(
		textColors,
	)}\n\n`
	colorsContent += `export const backgroundColors = ${JSON.stringify(
		backgroundColors,
	)}\n\n`
	colorsContent += `export const borderColors = ${JSON.stringify(
		borderColors,
	)}\n\n`

	writeFileSync(outputThemeFile, themeContent)
	writeFileSync(outputColorsFile, colorsContent)
	exec(`npx prettier --write ${outputThemeFile} ${outputColorsFile}`)
})

const extractColors = (obj: any) => {
	const keys = Object.keys(obj)

	keys.forEach((key) => {
		const { value } = obj[key]

		if (value) {
			colorTokens[key] = obj[key].value
		} else {
			extractColors(obj[key])
		}
	})
}

const extractThemeVariables = (obj: any, tokens = {}, keyString = '') => {
	const keys = Object.keys(obj)

	keys.forEach((key) => {
		tokens[key] = {}
		const { value } = obj[key]
		const themeVarKey = keyString ? `${keyString}.${key}` : `${key}`

		if (value) {
			// Get the variable reference: {Neutrals.Greyscale.N3} => N3
			const colorKey = value.match(/[^.]+(?=})/i)

			// We can't use variable references for rgb values the way they are stored
			// in the token data, so convert from hex to rgb when necessary.
			const color = value.startsWith('rgb')
				? hexToRgb(colorTokens[colorKey])
				: colorTokens[colorKey]

			// Replace the variable value with the actual color value.
			const transformedKey = value.replace(/\{.*\}/i, color)

			tokens[key] = transformedKey
			colorTokens[themeVarKey] = transformedKey
		} else {
			extractThemeVariables(obj[key], tokens[key], themeVarKey)
		}
	})
}

const objectKeysToCamelCase = (obj: any) => {
	return Object.keys(obj).reduce((newObj, key) => {
		const val = obj[key]
		const newVal =
			typeof val === 'object' ? objectKeysToCamelCase(val) : val

		const newKey = key
			.split('.')
			.map((k) => camelCase(k))
			.join('.')
		newObj[newKey] = newVal

		return newObj
	}, {})
}

const hexToRgb = (hex: string) => {
	hex = hex.replace('#', '')

	const r = parseInt(hex.substring(0, 2), 16)
	const g = parseInt(hex.substring(2, 4), 16)
	const b = parseInt(hex.substring(4, 6), 16)

	return `${r}, ${g}, ${b}`
}

const valuesStartingWith = (
	colors: any,
	prefixes: { [key: string]: string },
) => {
	const defaultColors = ['inherit', 'white', 'black']

	return Object.keys(colors).reduce((newObj, key) => {
		const val = colors[key]
		const newVal =
			typeof val === 'object' ? valuesStartingWith(val, prefixes) : val

		if (defaultColors.includes(key)) {
			console.log('mathces default color')
			newObj[key] = newVal
		} else {
			for (const prefix in prefixes) {
				if (!key.startsWith(prefix)) continue

				const newKey = key.replace(prefixes[prefix], '')
				newObj[newKey] = newVal
			}
		}

		return newObj
	}, {})
}

import { exec } from 'child_process'
import camelCase from 'lodash.camelcase'
import { readFile, writeFileSync } from 'node:fs'

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

	extractColors(json.values.Primitives)
	extractThemeVariables(json.values['Light theme'], lightThemeTokens)

	const theme = objectKeysToCamelCase(lightThemeTokens)
	let themeContent = `import { createGlobalTheme } from '@vanilla-extract/css'\n\n`
	themeContent += `export const themeVars = createGlobalTheme('.highlight-light-theme', ${JSON.stringify(
		theme,
	)})`

	const colors = objectKeysToCamelCase(colorTokens)
	const colorsContent = `export const colors = ${JSON.stringify(colors)}`

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

const extractThemeVariables = (obj: any, tokens = {}) => {
	const keys = Object.keys(obj)

	keys.forEach((key) => {
		tokens[key] = {}
		const { value } = obj[key]

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
		} else {
			extractThemeVariables(obj[key], tokens[key])
		}
	})
}

const objectKeysToCamelCase = (obj: any) => {
	return Object.keys(obj).reduce((newObj, key) => {
		const val = obj[key]
		const newVal =
			typeof val === 'object' ? objectKeysToCamelCase(val) : val

		newObj[camelCase(key)] = newVal

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

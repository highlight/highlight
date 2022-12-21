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

	extractColors(json.values.Primitives)
	extractThemeVariables(json.values['Light theme'], lightThemeTokens)

	const theme = objectKeysToCamelCase(lightThemeTokens)
	let themeContent = `import { createTheme } from '@vanilla-extract/css'\n\n`
	themeContent += `export const [themeClass, themeVars] = createTheme(${JSON.stringify(
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

const hexToRgb = (hex) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

	return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
		result[3],
		16,
	)}`
}

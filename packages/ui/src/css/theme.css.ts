import { createTheme, createThemeContract } from '@vanilla-extract/css'
import { vars } from './vars'

export const themeVars = createThemeContract({
	background: {
		primary: '',
	},
	text: {
		primary: '',
	},
})

export const lightThemeClass = createTheme(themeVars, {
	background: {
		primary: vars.color.white,
	},
	text: {
		primary: vars.color.neutral800,
	},
})

export const darkThemeClass = createTheme(themeVars, {
	background: {
		primary: vars.color.neutral800,
	},
	text: {
		primary: vars.color.white,
	},
})

console.log(lightThemeClass, darkThemeClass)

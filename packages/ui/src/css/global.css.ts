import { globalStyle } from '@vanilla-extract/css'
import { baseTheme } from './sprinkles.css'

export const global = globalStyle('html', {
	fontFamily: baseTheme.bodyFontFamily,
})

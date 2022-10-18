import { globalStyle } from '@vanilla-extract/css'
import { vars } from './theme.css'

export const global = globalStyle('html', {
	fontFamily: vars.typography.family.body,
})

import { style } from '@vanilla-extract/css'
import { vars } from '@highlight-run/ui/vars'

export const card = style({
	backgroundColor: vars.theme.static.surface.nested,
	padding: 8,
})

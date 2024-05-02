import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const menuButton = style({ height: 18 })
export const menuItem = style({ padding: 0 })

export const menuContents = style({
	padding: 0,
	borderRadius: 6,
	border: vars.border.divider,
	backgroundColor: vars.theme.static.surface.default,
	boxShadow: vars.shadows.medium,
})

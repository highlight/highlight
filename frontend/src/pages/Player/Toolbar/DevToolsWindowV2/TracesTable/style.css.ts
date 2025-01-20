import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

// need to overwrite default style since related rows are combined within a div element
// (i.e. multiple last of type per table)
export const dataRow = style({
	borderBottom: `none !important`,
	opacity: 0.4,
})

export const pastRow = style({
	opacity: 1,
})

export const attributesRow = style({
	borderBottom: `1px solid ${vars.theme.static.divider.weak} !important`,
	backgroundColor: vars.theme.static.surface.raised,
})

export const currentRow = style({
	borderBottom: `2px solid ${vars.theme.interactive.fill.primary.enabled} !important`,
})

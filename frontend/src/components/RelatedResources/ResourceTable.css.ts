import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const textHighlight = style({
	backgroundColor: vars.theme.static.surface.sentiment.caution,
	borderRadius: 4,
	color: 'inherit !important', // override styles from the highlighter component
	display: 'inline-block',
	padding: '0 4px',
})

// need to overwrite default style since related rows are combined within a div element
// (i.e. multiple last of type per table)
export const dataRow = style({
	borderBottom: `none !important`,
})

export const attributesRow = style({
	borderBottom: `1px solid ${vars.theme.static.divider.weak} !important`,
	backgroundColor: vars.theme.static.surface.raised,
})

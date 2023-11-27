import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const codeContainer = style({
	backgroundColor: vars.theme.static.surface.nested,
	border: `1px solid ${vars.theme.static.divider.weak}`,
	borderRadius: vars.borderRadius[5],
	padding: `${vars.space[6]} ${vars.space[4]}`,
})

export const metadataTable = style({
	border: `1px solid ${vars.theme.static.divider.weak}`,
	borderRadius: vars.borderRadius[6],
	width: '100%',
})

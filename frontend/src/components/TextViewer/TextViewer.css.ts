import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const jsonContainer = style({
	padding: 4,
	gap: '2px',
	border: `1px solid ${vars.theme.static.divider.weak}`,
	borderRadius: 5,
})

export const consoleText = style({
	whiteSpace: 'pre',
})

import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const languageGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
	gap: '10px',
	padding: '8px',
})

export const checkbox = style({
	border: vars.border.secondary,
	borderRadius: 4,
	display: 'flex',
	padding: 1,
})

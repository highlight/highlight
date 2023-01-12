import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const container = style({
	position: 'relative',
	width: '100%',
})

export const downloadButton = style({
	display: 'flex',
	position: 'absolute',
	right: 8,
	zIndex: 5,
})

export const jsonContainer = style({
	padding: 4,
	gap: '2px',
	border: `1px solid ${vars.theme.static.divider.weak}`,
	borderRadius: 5,
})

export const consoleText = style({
	lineHeight: '16px',
	color: 'rgba(26, 21, 35, 0.72)',
	whiteSpace: 'pre-wrap',
})

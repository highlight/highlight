import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const avatar = style({
	height: 28,
	width: 28,
})

export const defaultText = style({
	color: vars.theme.static.content.default,
})

export const secondaryText = style({
	color: vars.theme.interactive.fill.secondary.content.text,
})

export const userEnhancedGrid = style({
	alignItems: 'center',
	columnGap: 14,
	display: 'grid',
	gridTemplateColumns: `fit-content(20px) auto`,
	padding: 8,
	position: 'relative',
})

export const enhancedSocial = style({
	alignItems: 'center',
	color: 'var(--color-gray-500) !important',
	columnGap: '6px',
	display: 'flex',
})

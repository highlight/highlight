import { vars } from '@highlight-run/ui/src'
import { style } from '@vanilla-extract/css'

export const avatar = style({
	height: 28,
	width: 28,
})

export const sessionAttributeRow = style({
	alignItems: 'center',
	display: 'grid',
	gridTemplateColumns: `80px 1fr`,
	gridGap: 8,
})

export const sessionAttributeText = style({
	alignItems: 'center',
	color: vars.theme.static.content.weak,
	height: 20,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	width: '100%',
})

export const defaultText = style({
	color: vars.theme.static.content.default,
})

export const secondaryText = style({
	color: vars.theme.interactive.fill.secondary.content.text,
})

export const moreSessionsTag = style({
	borderRadius: 4,
})

export const userEnhancedGrid = style({
	alignItems: 'center',
	columnGap: 14,
	display: 'grid',
	gridTemplateColumns: `fit-content(20px) auto`,
	padding: 8,
	position: 'relative',
})

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
	display: 'inline-flex',
	alignItems: 'center',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	height: 20,
	width: '100%',
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

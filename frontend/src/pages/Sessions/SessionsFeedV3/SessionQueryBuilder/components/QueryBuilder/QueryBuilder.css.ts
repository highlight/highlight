import { style } from '@vanilla-extract/css'

export const flatRight = style({
	borderTopRightRadius: 0,
	borderBottomRightRadius: 0,
})

export const flatLeft = style({
	borderTopLeftRadius: 0,
	borderBottomLeftRadius: 0,
})

export const tagPopoverAnchor = style({
	display: 'inline-flex',
	height: 20,
})

export const addButton = style({
	height: 20,
	width: 20,
})

export const tagKey = style({
	flex: 1,
	wordBreak: 'normal',
	whiteSpace: 'nowrap',
})

export const tagValue = style({
	flex: 1,
})

export const noShrink = style({
	flexShrink: 0,
})

export const maxHalfWidth = style({
	maxWidth: '50%',
})

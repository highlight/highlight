import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const tag = style({
	padding: '2px 4px',
	background: colors.n4,
	boxShadow: 'inset 0 -1px #0000001a',
	border: 'none',
	borderRadius: '5px',
})

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
	wordBreak: 'normal',
	whiteSpace: 'nowrap',
})

export const noShrink = style({
	flexShrink: 0,
})

export const maxHalfWidth = style({
	maxWidth: '50%',
})

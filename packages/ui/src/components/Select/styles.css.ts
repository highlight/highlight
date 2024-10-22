import { keyframes, style } from '@vanilla-extract/css'

import { sprinkles } from '@/sprinkles'
import { vars } from '@/vars'

export const select = style([
	sprinkles({
		alignItems: 'center',
		backgroundColor: 'white',
		border: 'secondary',
		borderRadius: '6',
		display: 'flex',
		py: '2',
		width: 'full',
	}),
	{
		minHeight: 28,
	},
])

export const item = style([
	sprinkles({
		alignItems: 'center',
		cursor: 'pointer',
		display: 'flex',
		gap: '4',
		px: '8',
		py: '6',
	}),
	{
		selectors: {
			'&[data-active-item]': {
				backgroundColor: vars.theme.interactive.overlay.secondary.hover,
			},
			'&:active': {
				backgroundColor:
					vars.theme.interactive.overlay.secondary.pressed,
			},
		},
	},
])

export const popover = style([
	sprinkles({
		backgroundColor: 'white',
		border: 'secondary',
		borderRadius: '4',
		py: '4',
		position: 'relative',
		boxShadow: 'medium',
	}),
	{
		maxWidth: 320,
		minWidth: 200,
		width: 'fit-content',
		zIndex: 6,
	},
])

export const combobox = style([
	sprinkles({
		border: 'dividerWeak',
		borderRadius: '4',
		m: '0',
		py: '6',
		px: '8',
		width: 'full',
	}),
	{
		boxSizing: 'border-box',
		fontSize: '13px',
		lineHeight: '13px',
		caretColor: vars.theme.interactive.fill.primary.enabled,
		outline: 0,
	},
])

export const checkbox = style([
	sprinkles({
		alignItems: 'center',
		border: 'secondary',
		borderRadius: '4',
		display: 'flex',
		justifyContent: 'center',
	}),
	{
		height: 16,
		width: 16,
		selectors: {
			[`${item}[aria-selected="true"] &`]: {
				backgroundColor: vars.theme.interactive.fill.primary.enabled,
			},
			[`${item}[aria-selected="false"] &`]: {
				backgroundColor: 'white',
			},
		},
	},
])

export const checkmark = style([
	{
		flexShrink: 0,
	},
])

const rotate = keyframes({
	'0%': {
		transform: 'rotate(0deg)',
	},
	'100%': {
		transform: 'rotate(360deg)',
	},
})

export const loadingIcon = style({
	position: 'absolute',
	right: 8,
	animation: `1s ${rotate} linear infinite`,
})

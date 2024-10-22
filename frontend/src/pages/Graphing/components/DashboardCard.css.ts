import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const graphCard = style({
	borderBottom: vars.border.dividerWeak,

	'@media': {
		[`(width <= 850px)`]: {
			selectors: {
				'&:nth-child(1n + 1):nth-last-child(-n + 3)': {
					borderBottom: 'none',
				},
				'&:nth-child(1n + 1):nth-last-child(-n + 3) ~ &': {
					borderBottom: 'none',
				},
			},
		},
		[`(850px < width <= 1250px)`]: {
			selectors: {
				'&:nth-child(2n + 1):nth-last-child(-n + 4)': {
					borderBottom: 'none',
				},
				'&:nth-child(2n + 1):nth-last-child(-n + 4) ~ &': {
					borderBottom: 'none',
				},
			},
		},
		[`(1250px < width)`]: {
			selectors: {
				'&:nth-child(3n + 1):nth-last-child(-n + 5)': {
					borderBottom: 'none',
				},
				'&:nth-child(3n + 1):nth-last-child(-n + 5) ~ &': {
					borderBottom: 'none',
				},
			},
		},
	},
})

export const cardInner = style({
	backgroundColor: vars.color.white,
})

export const cardDragging = style({
	zIndex: 1,
})

export const handle = style({
	cursor: 'grab',
})

export const handleDragging = style({
	cursor: 'grabbing',
})

export const buttonContainer = style({
	position: 'absolute',
	right: '0',
	lineHeight: '24px',
	height: '24px',
	alignItems: 'center',
	zIndex: 1,
})

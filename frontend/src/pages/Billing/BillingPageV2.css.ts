import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const pageWrapper = style({
	width: 560,
	marginTop: 36,
	marginBottom: 12,
})

export const progressBarBackground = style({
	height: 4,
	borderRadius: 2,
	backgroundColor: vars.color.n5,
	overflow: 'hidden',
})

export const progressBar = style({
	backgroundColor: vars.color.n11,
})

export const progressBarOverage = style({
	backgroundColor: vars.color.y11,
})

export const progressAmount = style({
	height: 14,
})

export const usageTitle = style({
	height: 20,
})

export const totalBox = style({
	height: 20,
})

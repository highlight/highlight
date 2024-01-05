import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const pageWrapper = style({
	width: 960,
	marginTop: 32,
	marginBottom: 32,
})

export const pageHeader = style({
	height: 40,
	bottom: 0,
	right: 0,
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

export const productSelections = style({
	width: 344,
})

export const predictedCost = style({
	width: 216,
})

export const costBreakdown = style({
	backgroundColor: vars.color.n2,
})

export const costLineItem = style({
	height: 16,
})

export const formSection = style({
	paddingTop: 8,
})

export const step = style({
	height: 28,
})

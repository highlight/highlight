import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const pageWrapper = style({
	width: 540,
	marginTop: 24,
})

export const pageHeader = style({
	height: 40,
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

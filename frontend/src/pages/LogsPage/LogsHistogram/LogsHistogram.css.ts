import { borders } from '@highlight-run/ui/borders'
import { colors } from '@highlight-run/ui/colors'
import { pulseKeyframes } from '@highlight-run/ui/keyframes'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const OUTLINE_HISTOGRAM_HEIGHT = 120
export const OUTLINE_PADDING = 2
export const LEGEND_HISTOGRAM_HEIGHT = 98

export const regularHeight = style({
	height: 62,
})

export const outlineHeight = style({
	height: OUTLINE_HISTOGRAM_HEIGHT,
})

export const hover = style({
	cursor: 'pointer',
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.overlay.secondary.hover,
		},
	},
})

export const popoverContent = style({
	backgroundColor: vars.theme.static.surface.default,
	zIndex: '10 !important',
	border: borders.divider,
	boxShadow: vars.shadows.medium,
	borderRadius: 6,
	width: 224,
})

export const popoverContentRow = style({
	height: 28,
})

export const dragSelection = style({
	backgroundColor: colors.n7,
	opacity: 0.5,
})

export const thresholdArea = style({
	opacity: 0.2,
	left: 0,
	width: 'calc(100% - 4px)',
	pointerEvents: 'none',
})

export const barsLoading = style({
	animation: pulseKeyframes,
	animationDuration: '1.25s',
	animationIterationCount: 'infinite',
	animationTimingFunction: 'ease-out',
})

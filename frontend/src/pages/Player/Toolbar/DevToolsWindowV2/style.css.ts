import { colors } from '@highlight-run/ui/colors'
import { style } from '@vanilla-extract/css'

export const devToolsWindowV2 = style({
	alignItems: 'center',
	backgroundColor: colors.white,
	display: 'flex',
	flexDirection: 'column',
	zIndex: 5,
})

export const switchInverted = style({
	transform: 'rotate(90deg)',
})

export const autoScroll = style({
	height: 20,
})

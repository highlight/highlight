import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const devToolsBoxMargin = 12

export const devToolsWindowV2 = style({
	alignItems: 'center',
	backgroundColor: colors.white,
	borderRadius: 8,
	display: 'flex',
	flexDirection: 'column',
	zIndex: 5,
	position: 'relative',
	margin: `0 ${devToolsBoxMargin}px`,
})

export const controlBarButtonDeselected = style({
	backgroundColor: 'white',
	boxShadow: 'none',
	color: colors.neutralN11,
})

export const switchInverted = style({
	transform: 'rotate(90deg)',
})

export const pageWrapper = style({
	width: '100%',
	height: '100%',
})

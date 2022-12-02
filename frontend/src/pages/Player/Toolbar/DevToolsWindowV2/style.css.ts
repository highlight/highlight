import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const devToolsWindowV2 = style({
	alignItems: 'center',
	backgroundColor: colors.white,
	border: `1px solid ${colors.neutralN6}`,
	borderRadius: 8,
	display: 'flex',
	flexDirection: 'column',
	zIndex: 5,
	position: 'relative',
})

export const controlBarButtonDeselected = style({
	backgroundColor: 'white',
	boxShadow: 'none',
})

export const switchInverted = style({
	transform: 'rotate(90deg)',
})

export const pageWrapper = style({
	width: '100%',
	height: '100%',
})

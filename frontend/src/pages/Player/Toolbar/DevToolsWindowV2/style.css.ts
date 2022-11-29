import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const devToolsWindowV2 = style({
	alignItems: 'center',
	backgroundColor: colors.white,
	border: `1px solid ${colors.neutral100}`,
	borderBottom: 0,
	borderRadius: '2px 2px 0 0',
	display: 'flex',
	flexDirection: 'column',
	zIndex: 5,
	position: 'relative',
})

export const errorsBox = style({
	maxHeight: 200,
	overflowY: 'scroll',
	width: '100%',
	padding: '0 8px',
})

export const errorRow = style({
	alignItems: 'center',
	backgroundColor: colors.white,
	borderBottom: `1px solid ${colors.neutralN6}`,
	borderRadius: 6,
	boxShadow: colors.innerShadowOnGrey,
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
	padding: 8,
	selectors: {
		'&:focus, &:active &:hover': {
			backgroundColor: colors.neutral100,
		},
	},
	width: '100%',
})

export const switchInverted = style({
	transform: 'rotate(90deg)',
})

export const autoScroll = style({
	padding: '0 4px',
})

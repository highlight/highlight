import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const errorsBox = style({
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

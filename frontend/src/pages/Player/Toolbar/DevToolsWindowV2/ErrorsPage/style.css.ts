import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const errorsBox = style({
	width: '100%',
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	padding: 8,
	overflowX: 'hidden',
	overflowY: 'auto',
	wordWrap: 'break-word',
})

export const errorRowVariants = recipe({
	base: {
		backgroundColor: colors.white,
		display: 'grid',
		gridTemplateColumns: '1fr auto 120px',
		padding: 8,
		width: '100%',
		borderRadius: 6,
		selectors: {
			'&:hover': {
				backgroundColor: colors.neutralN4,
				borderBottom: `1px solid ${colors.neutralN6}`,
				boxShadow: colors.innerShadowOnGrey,
			},
		},
	},
	variants: {
		current: {
			true: {
				backgroundColor: colors.neutralN4,
				borderBottom: `1px solid ${colors.neutralN6}`,
				boxShadow: colors.innerShadowOnGrey,
			},
			false: {},
		},
	},
})

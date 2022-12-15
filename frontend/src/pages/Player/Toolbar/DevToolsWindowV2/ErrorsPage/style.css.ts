import { shadows } from '@highlight-run/ui/src/components/Button/styles.css'
import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const errorsBox = style({
	display: 'flex',
	flexDirection: 'column',
	fontSize: 13,
	height: '100%',
	overflowX: 'hidden',
	overflowY: 'auto',
	padding: 8,
	width: '100%',
	wordWrap: 'break-word',
})

export const errorRowVariants = recipe({
	base: {
		backgroundColor: colors.neutralN1,
		borderRadius: 6,
		color: colors.neutralN11,
		display: 'grid',
		gridTemplateColumns: '3fr 1fr auto 100px',
		gap: 32,
		marginBottom: 1,
		padding: 8,
		width: '100%',
		selectors: {
			'&:hover': {
				backgroundColor: colors.neutralN4,
				borderBottom: `1px solid ${colors.neutralN6}`,
				boxShadow: shadows.grey,
				marginBottom: 0,
			},
		},
	},
	variants: {
		current: {
			true: {
				backgroundColor: colors.neutralN4,
				borderBottom: `1px solid ${colors.neutralN6}`,
				boxShadow: shadows.grey,
				marginBottom: 0,
			},
			false: {},
		},
	},
})

export const errorBody = style({
	alignItems: 'center',
	display: 'flex',
	wordWrap: 'break-word',
})

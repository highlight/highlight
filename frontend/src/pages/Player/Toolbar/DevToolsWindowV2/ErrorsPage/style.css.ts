import { keepsLines } from '@highlight-run/ui'
import { shadows } from '@highlight-run/ui/src/components/Button/styles.css'
import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const errorsContainer = style({
	fontSize: 13,
	height: '100%',
	overflowX: 'hidden',
	overflowY: 'auto',
})

export const errorRowVariants = recipe({
	base: {
		borderRadius: 6,
		color: colors.n11,
		cursor: 'pointer',
		display: 'grid',
		gridTemplateColumns: '3fr 1fr auto 100px 20px',
		gap: 8,
		marginBottom: 1,
		padding: 8,
		selectors: {
			'&:hover': {
				backgroundColor: colors.n4,
				borderBottom: `1px solid ${colors.n6}`,
				boxShadow: shadows.grey,
				marginBottom: 0,
			},
		},
	},
	variants: {
		current: {
			true: {
				backgroundColor: colors.n4,
				borderBottom: `1px solid ${colors.n6}`,
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

export const singleLine = style({
	...keepsLines(1),
})

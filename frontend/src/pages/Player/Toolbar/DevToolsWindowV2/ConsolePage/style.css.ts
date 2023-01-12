import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'
import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

export const consoleBox = style({
	width: '100%',
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	padding: '0 8px',
	overflowX: 'hidden',
	overflowY: 'auto',
	wordWrap: 'break-word',
})

export const consoleBar = style({
	width: 2,
	borderRadius: 4,
	marginRight: 4,
})

export const consoleText = style({
	lineHeight: '20px',
	color: 'rgba(26, 21, 35, 0.72)',
})

export const consoleRow = style({
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'flex-start',
	padding: '2px 4px',
	margin: '8px 0',
	selectors: {
		'&:focus, &:active, &:hover': {
			backgroundColor: colors.n5,
		},
	},
})

export const variants = recipe({
	variants: {
		type: {
			trace: { backgroundColor: colors.lb700 },
			info: { backgroundColor: 'rgba(26, 21, 35, 0.72)' },
			log: { backgroundColor: colors.n11 },
			warn: { backgroundColor: colors.orange500 },
			error: { backgroundColor: colors.red500 },
			assert: { backgroundColor: colors.r9 },
		},
	},

	defaultVariants: {
		type: 'log',
	},
})

export type Variants = RecipeVariants<typeof variants>

export const messageRowVariants = recipe({
	base: {
		borderRadius: 4,
	},
	variants: {
		current: {
			true: {
				backgroundColor: colors.n4,
			},
			false: {},
		},
	},
})

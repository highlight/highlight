import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'
import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

export const consoleBox = style({
	width: '100%',
	padding: '0 8px',
})

export const consoleBar = style({
	width: 2,
	borderRadius: 4,
	marginRight: 4,
})

export const consoleRow = style({
	backgroundColor: colors.white,
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'flex-start',
	padding: '2px 4px',
	selectors: {
		'&:focus, &:active &:hover': {
			backgroundColor: colors.neutral100,
		},
	},
})

export const variants = recipe({
	variants: {
		type: {
			trace: { backgroundColor: 'green' },
			info: { backgroundColor: 'cyan' },
			log: { backgroundColor: 'rgba(26, 21, 35, 0.72)' },
			warn: { backgroundColor: 'orange' },
			error: { backgroundColor: 'red' },
			assert: { backgroundColor: 'red' },
		},
	},

	defaultVariants: {
		type: 'log',
	},
})

export type Variants = RecipeVariants<typeof variants>

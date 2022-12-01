import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'
import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

export const consoleBox = style({
	width: '100%',
	padding: '0 8px',
})

export const consoleRow = style({
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

export const variants = recipe({
	variants: {
		type: {
			trace: { borderLeft: '4px solid red' },
			info: { borderLeft: '4px solid cyan' },
			log: { borderLeft: '4px solid rgba(26, 21, 35, 0.72)' },
			warn: { borderLeft: '4px solid orange' },
			error: { borderLeft: '4px solid blue' },
		},
	},

	defaultVariants: {
		type: 'log',
	},
})

export type Variants = RecipeVariants<typeof variants>

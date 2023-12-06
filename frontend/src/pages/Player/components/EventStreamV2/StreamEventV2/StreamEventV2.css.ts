import { buttonStyles } from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

export const variants = recipe({
	base: [
		{
			borderRadius: 6,
			display: 'flex',
			flexDirection: 'column',
			gap: 4,
			padding: 8,
			selectors: {
				'&:hover': {
					backgroundColor:
						vars.theme.interactive.overlay.secondary.hover,
				},
			},
			width: '100%',
		},
	],

	variants: {
		current: {
			false: {},
			true: {
				backgroundColor:
					vars.theme.interactive.overlay.secondary.pressed,
				boxShadow: buttonStyles.shadows.grey,
			},
		},
	},

	defaultVariants: {
		current: false,
	},
})

export type Variants = RecipeVariants<typeof variants>

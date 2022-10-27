import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'

export const variants = recipe({
	variants: {
		size: {
			small: sprinkles({
				height: 'large',
				borderRadius: 'xSmall',
				px: 'xSmall',
				py: 'none',
			}),
			medium: sprinkles({
				height: 'wide',
				borderRadius: 'xTiny',
				px: 'xSmall',
				py: 'xxSmall',
			}),
			large: sprinkles({
				height: 'xLarge',
				borderRadius: 'tiny',
				px: 'tiny',
				py: 'xxSmall',
			}),
		},
		variant: {
			white: sprinkles({ background: 'white', border: 'neutral' }),
			grey: sprinkles({ background: 'neutral100' }),
			outlineGrey: sprinkles({
				border: 'neutral',
			}),
			green: sprinkles({
				background: 'green500',
			}),
		},
	},

	defaultVariants: {
		size: 'small',
		variant: 'white',
	},
})

export type Variants = RecipeVariants<typeof variants>

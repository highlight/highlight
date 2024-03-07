import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

import { sprinkles } from '../../css/sprinkles.css'

export const variants = recipe({
	variants: {
		size: {
			small: sprinkles({ padding: '6' }),
			medium: sprinkles({ padding: '12' }),
			large: sprinkles({ padding: '16' }),
		},
		border: {
			none: {},
			primary: sprinkles({ border: 'primary' }),
			secondary: sprinkles({ border: 'secondary' }),
		},
		rounded: {
			true: sprinkles({ borderRadius: '6' }),
			false: {},
		},
	},

	defaultVariants: {
		border: 'secondary',
		rounded: true,
		size: 'medium',
	},
})

export type Variants = RecipeVariants<typeof variants>

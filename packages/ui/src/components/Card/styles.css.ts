import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'

export const variants = recipe({
	variants: {
		mode: {
			light: sprinkles({ background: 'white', color: 'black' }),
			dark: sprinkles({ background: 'purple900', color: 'white' }),
		},
		size: {
			small: sprinkles({ padding: 'small' }),
			medium: sprinkles({ padding: 'medium' }),
			large: sprinkles({ padding: 'large' }),
		},
		border: {
			none: {},
			neutral: sprinkles({ border: 'neutral' }),
			purple: sprinkles({ border: 'purple' }),
			black: sprinkles({ border: 'black' }),
		},
		rounded: {
			true: sprinkles({ borderRadius: 'medium' }),
			false: {},
		},
	},

	defaultVariants: {
		border: 'neutral',
		rounded: true,
		size: 'medium',
	},
})

export type Variants = RecipeVariants<typeof variants>

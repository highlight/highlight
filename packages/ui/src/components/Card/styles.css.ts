import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'

export const variants = recipe({
	variants: {
		mode: {
			light: sprinkles({ background: 'white', color: 'black' }),
			dark: sprinkles({ background: 'p12', color: 'white' }),
		},
		size: {
			small: sprinkles({ padding: '6' }),
			medium: sprinkles({ padding: '12' }),
			large: sprinkles({ padding: '16' }),
		},
		border: {
			none: {},
			neutral: sprinkles({ border: 'secondary' }),
			purple: sprinkles({ border: 'primary' }),
		},
		rounded: {
			true: sprinkles({ borderRadius: '6' }),
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

import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { typographyStyles } from '../Text/styles.css'

export const variants = recipe({
	variants: {
		size: {
			xSmall: { height: 16, width: 16, ...typographyStyles.size.xSmall },
			small: { height: 16, width: 16, ...typographyStyles.size.small },
			medium: { height: 16, width: 16, ...typographyStyles.size.small },
			large: { height: 16, width: 16, ...typographyStyles.size.small },
			xLarge: { height: 16, width: 16, ...typographyStyles.size.large },
		},
	},

	defaultVariants: {
		size: 'small',
	},
})

export type Variants = RecipeVariants<typeof variants>

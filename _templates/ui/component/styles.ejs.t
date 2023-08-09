---
to: packages/ui/src/components/<%= name %>/styles.css.ts
---

import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'

export const variants = recipe({
	variants: {
		size: {
			small: sprinkles({ px: '4', py: '6' }),
			large: sprinkles({ px: '6', py: '8' }),
		},
	},

	defaultVariants: {
		size: 'small'
	},
})

export type Variants = RecipeVariants<typeof variants>

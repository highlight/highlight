---
to: packages/ui/src/components/<%= name %>/<%= name %>.css.ts
---

import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'

export const variants = recipe({
	variants: {
		mode: {
			light: sprinkles({ background: 'white', color: 'black' }),
			dark: sprinkles({ background: 'purple900', color: 'white' }),
		},
	},

	defaultVariants: {
		mode: 'light'
	},
})

export type Variants = RecipeVariants<typeof variants>

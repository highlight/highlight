import { ComplexStyleRule } from '@vanilla-extract/css'
import { RecipeVariants, recipe } from '@vanilla-extract/recipes'

export const lineClampStyles: ComplexStyleRule = {
	display: '-webkit-box',
	WebkitBoxOrient: 'vertical',
	overflow: 'hidden',
	wordBreak: 'break-all',
}

export const variants = recipe({
	variants: {
		lines: {
			'1': { ...lineClampStyles, WebkitLineClamp: 1, lineClamp: 1 },
			'2': { ...lineClampStyles, WebkitLineClamp: 2, lineClamp: 2 },
			'3': { ...lineClampStyles, WebkitLineClamp: 3, lineClamp: 3 },
			'4': { ...lineClampStyles, WebkitLineClamp: 4, lineClamp: 4 },
		},
	},
})

export type Variants = RecipeVariants<typeof variants>

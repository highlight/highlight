import { createStyleObject } from '@capsizecss/core'
import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { steradianFontMetrics, typography } from '../Text/styles.css'

// Headings
export const h4 = createStyleObject({
	fontSize: 20,
	lineGap: 8,
	fontMetrics: steradianFontMetrics,
})
export const h3 = createStyleObject({
	fontSize: 24,
	lineGap: 10,
	fontMetrics: steradianFontMetrics,
})
export const h2 = createStyleObject({
	fontSize: 30,
	lineGap: 12,
	fontMetrics: steradianFontMetrics,
})
export const h1 = createStyleObject({
	fontSize: 36,
	lineGap: 14,
	fontMetrics: steradianFontMetrics,
})

export const variants = recipe({
	base: [sprinkles({ margin: 'none' })],

	variants: {
		size: {
			h4: { ...h4, fontFamily: typography.family.heading },
			h3: { ...h3, fontFamily: typography.family.heading },
			h2: { ...h2, fontFamily: typography.family.heading },
			h1: { ...h1, fontFamily: typography.family.heading },
		},
	},
})

export type Variants = RecipeVariants<typeof variants>

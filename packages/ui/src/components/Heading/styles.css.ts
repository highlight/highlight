import { createStyleObject } from '@capsizecss/core'
import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { steradianFontMetrics, typographyStyles } from '../Text/styles.css'

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
	base: [sprinkles({ margin: '0' })],

	variants: {
		size: {
			h4: { ...h4, ...typographyStyles.family.heading },
			h3: { ...h3, ...typographyStyles.family.heading },
			h2: { ...h2, ...typographyStyles.family.heading },
			h1: { ...h1, ...typographyStyles.family.heading },
		},
	},
})

export type Variants = RecipeVariants<typeof variants>

import { createStyleObject } from '@capsizecss/core'
import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { steradianFontMetrics, typographyStyles } from '../Text/styles.css'

// Headings
export const h4 = createStyleObject({
	fontSize: 20,
	leading: 28,
	fontMetrics: steradianFontMetrics,
})
export const h3 = createStyleObject({
	fontSize: 24,
	leading: 34,
	fontMetrics: steradianFontMetrics,
})
export const h2 = createStyleObject({
	fontSize: 30,
	leading: 32,
	fontMetrics: steradianFontMetrics,
})
export const h1 = createStyleObject({
	fontSize: 36,
	leading: 50,
	fontMetrics: steradianFontMetrics,
})

export const variants = recipe({
	base: [sprinkles({ margin: '0' })],

	variants: {
		align: {
			center: {
				textAlign: 'center',
			},
		},
		level: {
			h1: {
				...h1,
				...typographyStyles.family.heading,
				fontWeight: '700',
			},
			h2: {
				...h2,
				...typographyStyles.family.heading,
				fontWeight: '700',
			},
			h3: {
				...h3,
				...typographyStyles.family.heading,
				fontWeight: '700',
			},
			h4: {
				...h4,
				...typographyStyles.family.heading,
				// This should be removed at some point, but we need to make sure the
				// other !important it is overriding can be removed.
				// https://github.com/highlight-run/highlight/blob/a96450680f7222af10b502f4ac6047b31410fd1c/frontend/src/index.scss#L240
				fontWeight: '500 !important',
			},
		},
	},
})

export type Variants = RecipeVariants<typeof variants>

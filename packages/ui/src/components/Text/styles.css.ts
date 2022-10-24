import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { createStyleObject } from '@capsizecss/core'
import plexoFontMetrics from '@capsizecss/metrics/iBMPlexMono'

const steradianFontMetrics = {
	ascent: 1000,
	descent: 300,
	capHeight: 703,
	lineGap: 0,
	unitsPerEm: 1000,
}

// TODO: Clean up creation of variants by iterating over weights
// xxSmall
export const xxSmallRegular = createStyleObject({
	fontSize: 11,
	lineGap: 1,
	fontMetrics: steradianFontMetrics,
})
export const xxSmallMedium = createStyleObject({
	fontSize: 11,
	lineGap: 1,
	fontMetrics: steradianFontMetrics,
})
export const xxSmallBold = createStyleObject({
	fontSize: 11,
	lineGap: 1,
	fontMetrics: steradianFontMetrics,
})

// xSmall
export const xSmallRegular = createStyleObject({
	fontSize: 12,
	lineGap: 4,
	fontMetrics: steradianFontMetrics,
})
export const xSmallMedium = createStyleObject({
	fontSize: 12,
	lineGap: 4,
	fontMetrics: steradianFontMetrics,
})
export const xSmallBold = createStyleObject({
	fontSize: 12,
	lineGap: 4,
	fontMetrics: steradianFontMetrics,
})

// Small
export const smallRegular = createStyleObject({
	fontSize: 13,
	lineGap: 7,
	fontMetrics: steradianFontMetrics,
})
export const smallMedium = createStyleObject({
	fontSize: 13,
	lineGap: 7,
	fontMetrics: steradianFontMetrics,
})
export const smallBold = createStyleObject({
	fontSize: 13,
	lineGap: 7,
	fontMetrics: steradianFontMetrics,
})

// Medium
export const mediumRegular = createStyleObject({
	fontSize: 14,
	lineGap: 6,
	fontMetrics: steradianFontMetrics,
})
export const mediumMedium = createStyleObject({
	fontSize: 14,
	lineGap: 6,
	fontMetrics: steradianFontMetrics,
})
export const mediumBold = createStyleObject({
	fontSize: 14,
	lineGap: 6,
	fontMetrics: steradianFontMetrics,
})

// Large
export const largeRegular = createStyleObject({
	fontSize: 16,
	lineGap: 8,
	fontMetrics: steradianFontMetrics,
})
export const largeMedium = createStyleObject({
	fontSize: 16,
	lineGap: 8,
	fontMetrics: steradianFontMetrics,
})
export const largeBold = createStyleObject({
	fontSize: 16,
	lineGap: 8,
	fontMetrics: steradianFontMetrics,
})

export const h4 = createStyleObject({
	fontSize: 20,
	lineGap: 8,
	fontMetrics: steradianFontMetrics,
})
export const h3 = createStyleObject({
	fontSize: 24,
	lineGap: 8,
	fontMetrics: steradianFontMetrics,
})
export const h2 = createStyleObject({
	fontSize: 30,
	lineGap: 6,
	fontMetrics: steradianFontMetrics,
})
export const h1 = createStyleObject({
	fontSize: 36,
	lineGap: 6,
	fontMetrics: steradianFontMetrics,
})

// Monospace
const plexo = createStyleObject({
	fontSize: 13,
	lineGap: 7,
	fontMetrics: plexoFontMetrics,
})

export const variants = recipe({
	variants: {
		variant: {
			xxSmallRegular: { ...xxSmallRegular, fontWeight: 300 },
			xxSmallSemibold: { ...xxSmallMedium, fontWeight: 400 },
			xxSmallBold: { ...xxSmallBold, fontWeight: 500 },
			xSmallRegular: { ...xSmallRegular, fontWeight: 300 },
			xSmallSemibold: { ...xSmallMedium, fontWeight: 400 },
			xSmallBold: { ...xSmallBold, fontWeight: 500 },
			smallRegular: { ...smallRegular, fontWeight: 300 },
			smallSemibold: { ...smallMedium, fontWeight: 400 },
			smallBold: { ...smallBold, fontWeight: 500 },
			mediumRegular: { ...mediumRegular, fontWeight: 300 },
			mediumSemibold: { ...mediumMedium, fontWeight: 400 },
			mediumBold: { ...mediumBold, fontWeight: 500 },
			largeRegular: { ...largeRegular, fontWeight: 300 },
			largeSemibold: { ...largeMedium, fontWeight: 400 },
			largeBold: { ...largeBold, fontWeight: 500 },
			h1: { ...h1, fontWeight: 700 },
			h2: { ...h2, fontWeight: 700 },
			h3: { ...h3, fontWeight: 500 },
			h4: { ...h4, fontWeight: 500 },
			mono: plexo,
		},
	},

	defaultVariants: {
		variant: 'smallRegular',
	},
})

export type Variants = RecipeVariants<typeof variants>

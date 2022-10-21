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

export const headingRegular = createStyleObject({
	fontSize: 20,
	lineGap: 8,
	fontMetrics: steradianFontMetrics,
})
export const headingMedium = createStyleObject({
	fontSize: 24,
	lineGap: 8,
	fontMetrics: steradianFontMetrics,
})
export const headingBold = createStyleObject({
	fontSize: 30,
	lineGap: 6,
	fontMetrics: steradianFontMetrics,
})
export const headingBlack = createStyleObject({
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
		font: {
			xxSmallRegular: xxSmallRegular,
			xxSmallSemibold: xxSmallMedium,
			xxSmallBold: xxSmallBold,
			xSmallRegular: xSmallRegular,
			xSmallSemibold: xSmallMedium,
			xSmallBold: xSmallBold,
			smallRegular: smallRegular,
			smallSemibold: smallMedium,
			smallBold: smallBold,
			mediumRegular: mediumRegular,
			mediumSemibold: mediumMedium,
			mediumBold: mediumBold,
			largeRegular: largeRegular,
			largeSemibold: largeMedium,
			largeBold: largeBold,
			h1: headingBlack,
			h2: headingBold,
			h3: headingMedium,
			h4: headingRegular,
			mono: plexo,
		},
	},

	defaultVariants: {
		font: 'smallRegular',
	},
})

export type Variants = RecipeVariants<typeof variants>

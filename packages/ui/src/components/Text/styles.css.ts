import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { createStyleObject } from '@capsizecss/core'
import plexoFontMetrics from '@capsizecss/metrics/iBMPlexMono'
import { globalStyle } from '@vanilla-extract/css'

export const bodyFontFamily =
	'Steradian, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol'
export const headingFontFamily =
	'Steradian, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif'
export const monospaceFontFamily = 'Roboto Mono, monospace'

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

// Monospace
const plexo = createStyleObject({
	fontSize: 13,
	lineGap: 7,
	fontMetrics: plexoFontMetrics,
})

export const variants = recipe({
	variants: {
		variant: {
			xxSmallRegular: {
				...xxSmallRegular,
				fontFamily: bodyFontFamily,
				fontWeight: 300,
			},
			xxSmallSemibold: {
				...xxSmallMedium,
				fontFamily: bodyFontFamily,
				fontWeight: 400,
			},
			xxSmallBold: {
				...xxSmallBold,
				fontFamily: bodyFontFamily,
				fontWeight: 500,
			},
			xSmallRegular: {
				...xSmallRegular,
				fontFamily: bodyFontFamily,
				fontWeight: 300,
			},
			xSmallSemibold: {
				...xSmallMedium,
				fontFamily: bodyFontFamily,
				fontWeight: 400,
			},
			xSmallBold: {
				...xSmallBold,
				fontFamily: bodyFontFamily,
				fontWeight: 500,
			},
			smallRegular: {
				...smallRegular,
				fontFamily: bodyFontFamily,
				fontWeight: 300,
			},
			smallSemibold: {
				...smallMedium,
				fontFamily: bodyFontFamily,
				fontWeight: 400,
			},
			smallBold: {
				...smallBold,
				fontFamily: bodyFontFamily,
				fontWeight: 500,
			},
			mediumRegular: {
				...mediumRegular,
				fontFamily: bodyFontFamily,
				fontWeight: 300,
			},
			mediumSemibold: {
				...mediumMedium,
				fontFamily: bodyFontFamily,
				fontWeight: 400,
			},
			mediumBold: {
				...mediumBold,
				fontFamily: bodyFontFamily,
				fontWeight: 500,
			},
			largeRegular: {
				...largeRegular,
				fontFamily: bodyFontFamily,
				fontWeight: 300,
			},
			largeSemibold: {
				...largeMedium,
				fontFamily: bodyFontFamily,
				fontWeight: 400,
			},
			largeBold: {
				...largeBold,
				fontFamily: bodyFontFamily,
				fontWeight: 500,
			},
			h1: {
				...h1,
				fontFamily: headingFontFamily,
				fontWeight: 700,
			},
			h2: {
				...h2,
				fontFamily: headingFontFamily,
				fontWeight: 700,
			},
			h3: {
				...h3,
				fontFamily: headingFontFamily,
				fontWeight: 500,
			},
			h4: {
				...h4,
				fontFamily: headingFontFamily,
				fontWeight: 500,
			},
			mono: { ...plexo, fontFamily: monospaceFontFamily },
		},
	},

	defaultVariants: {
		variant: 'smallRegular',
	},
})

export type Variants = RecipeVariants<typeof variants>

// Not the right place for this, but needs to be defined somewhere for the
// global styles to be injected.
globalStyle('body', {
	fontFamily: bodyFontFamily,
})

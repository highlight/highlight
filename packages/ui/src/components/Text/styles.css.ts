import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { createStyleObject } from '@capsizecss/core'
import plexoFontMetrics from '@capsizecss/metrics/iBMPlexMono'
import { globalStyle } from '@vanilla-extract/css'

// Generated at https://seek-oss.github.io/capsize/.
export const steradianFontMetrics = {
	ascent: 1000,
	descent: 300,
	capHeight: 703,
	lineGap: 0,
	unitsPerEm: 1000,
}

// Body
export const xxSmall = createStyleObject({
	fontSize: 11,
	lineGap: 1,
	fontMetrics: steradianFontMetrics,
})
export const xSmall = createStyleObject({
	fontSize: 12,
	lineGap: 4,
	fontMetrics: steradianFontMetrics,
})
export const small = createStyleObject({
	fontSize: 13,
	lineGap: 7,
	fontMetrics: steradianFontMetrics,
})
export const medium = createStyleObject({
	fontSize: 14,
	lineGap: 6,
	fontMetrics: steradianFontMetrics,
})
export const large = createStyleObject({
	fontSize: 16,
	lineGap: 8,
	fontMetrics: steradianFontMetrics,
})

// Monospace
const plexo = createStyleObject({
	fontSize: 13,
	lineGap: 7,
	fontMetrics: plexoFontMetrics,
})

const mainFontFamily = 'Steradian'

const family = {
	body: {
		fontFamily: `${mainFontFamily}, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol`,
	},
	heading: {
		fontFamily: `${mainFontFamily}, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif`,
	},
	monospace: {
		fontFamily:
			'IBM Plex Mono, Menlo, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier, monospace',
		...plexo,
	},
} as const

const size = {
	xxSmall: xxSmall,
	xSmall: xSmall,
	small: small,
	medium: medium,
	large: large,
} as const

const weight = {
	regular: { fontWeight: '300' },
	medium: { fontWeight: '400' },
	bold: { fontWeight: '500' },
} as const

export const typographyStyles = {
	family,
	size,
	weight,
} as const

export const variants = recipe({
	variants: {
		align: {
			center: { textAlign: 'center' },
			left: { textAlign: 'left' },
			right: { textAlign: 'right' },
		},
		family: typographyStyles.family,
		size: typographyStyles.size,
		weight: typographyStyles.weight,
		case: {
			capital: {
				textTransform: 'capitalize',
			},
			upper: {
				textTransform: 'uppercase',
			},
			lower: {
				textTransform: 'lowercase',
			},
		},
		break: {
			all: {
				wordBreak: 'break-all',
			},
			word: {
				wordBreak: 'break-word',
			},
			normal: {
				wordBreak: 'normal',
			},
			none: {
				whiteSpace: 'nowrap',
			},
		},
	},

	compoundVariants: [
		{
			variants: { family: 'monospace', weight: 'regular' },
			style: typographyStyles.weight.medium,
		},
		{
			variants: { family: 'body', size: 'xxSmall', weight: 'regular' },
			style: typographyStyles.weight.medium,
		},
		{
			variants: { family: 'body', size: 'xxSmall', weight: 'medium' },
			style: typographyStyles.weight.bold,
		},
		{
			variants: { family: 'body', size: 'xxSmall', weight: 'bold' },
			style: { fontWeight: 700 },
		},
	],

	defaultVariants: {
		align: 'left',
		family: 'body',
		size: 'small',
		weight: 'medium',
	},
})

export type Variants = RecipeVariants<typeof variants>

// Not the right place for this, but needs to be defined somewhere for the
// global styles to be injected.
globalStyle('body', {
	...typographyStyles.family.body,
})

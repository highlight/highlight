import { createStyleObject } from '@capsizecss/core'
import plexoFontMetrics from '@capsizecss/metrics/iBMPlexMono'
import fontMetrics from '@capsizecss/metrics/inter'
import { globalStyle } from '@vanilla-extract/css'
import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

import { themeVars } from '../../css/theme.css'

// Body
export const xxSmall = createStyleObject({
	fontSize: 11,
	leading: 12,
	fontMetrics,
})
export const xSmall = createStyleObject({
	fontSize: 12,
	leading: 16,
	fontMetrics,
})
export const small = createStyleObject({
	fontSize: 13,
	leading: 20,
	fontMetrics,
})
export const medium = createStyleObject({
	fontSize: 14,
	leading: 20,
	fontMetrics,
})
export const large = createStyleObject({
	fontSize: 16,
	leading: 24,
	fontMetrics,
})

// Monospace
export const sMonotype = createStyleObject({
	fontSize: 13,
	leading: 20,
	fontMetrics: plexoFontMetrics,
})
const xsMonotype = createStyleObject({
	fontSize: 11,
	leading: 16,
	fontMetrics: plexoFontMetrics,
})
const xxsMonotype = createStyleObject({
	fontSize: 10,
	leading: 14,
	fontMetrics: plexoFontMetrics,
})

const mainFontFamily = 'Inter'
const monospaceFontFamily = 'IBM Plex Mono'

export const family = {
	body: {
		fontFamily: `${mainFontFamily}, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol`,
	},
	heading: {
		fontFamily: `${mainFontFamily}, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif`,
	},
	monospace: {
		fontFamily: `${monospaceFontFamily}, Menlo, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier, monospace`,
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
	regular: { fontWeight: '400' },
	medium: { fontWeight: '500' },
	bold: { fontWeight: '600' },
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
			variants: { family: 'monospace', size: 'small' },
			style: { ...sMonotype, letterSpacing: -0.4 },
		},
		{
			variants: { family: 'monospace', size: 'xSmall' },
			style: { ...xsMonotype, letterSpacing: -0.4 },
		},
		{
			variants: { family: 'monospace', size: 'xxSmall' },
			style: { ...xxsMonotype, letterSpacing: -0.4 },
		},
	],

	defaultVariants: {
		family: 'body',
		size: 'small',
		weight: 'medium',
	},
})

export type Variants = RecipeVariants<typeof variants>

// Not the right place for this, but needs to be defined somewhere for the
// global styles to be injected.
globalStyle('body', {
	color: themeVars.static.content.default,
	fontFeatureSettings: '"tnum" off', // disable tabular numbers
	...typographyStyles.family.body,
})

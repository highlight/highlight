import { style, styleVariants } from '@vanilla-extract/css'
import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles'

import { mediaQueries } from '../../css/breakpoints'
import { Space } from '../../css/spaces'

export const columns = style({
	display: 'flex',
	flexWrap: 'wrap',
	minWidth: '100%',
})

export const column = style({
	boxSizing: 'border-box',
	minWidth: 0, // resolves issue with text truncation
})

const columnProperties = defineProperties({
	conditions: mediaQueries,
	defaultCondition: 'mobile',
	properties: {
		flex: {
			auto: '1 0 auto',
			'1': '0 0 calc(100% / 12)',
			'2': '0 0 calc(100% * 2 / 12)',
			'3': '0 0 calc(100% * 3 / 12)',
			'4': '0 0 calc(100% * 4 / 12)',
			'5': '0 0 calc(100% * 5 / 12)',
			'6': '0 0 calc(100% * 6 / 12)',
			'7': '0 0 calc(100% * 7 / 12)',
			'8': '0 0 calc(100% * 8 / 12)',
			'9': '0 0 calc(100% * 9 / 12)',
			'10': '0 0 calc(100% * 10 / 12)',
			'11': '0 0 calc(100% * 11 / 12)',
			'12': '0 0 100%',
		},
	},
})
export const columnSprinkles = createSprinkles(columnProperties)
export type ColumnSprinkles = Parameters<typeof columnSprinkles>[0]

const negativeMarginValues: { [K in Space]: string } = {
	'0': '0',
	'1': '-1px',
	'3': '-3px',
	'2': '-2px',
	'4': '-4px',
	'6': '-6px',
	'7': '-7px',
	'8': '-8px',
	'9': '-9px',
	'10': '-10px',
	'12': '-12px',
	'16': '-16px',
	'20': '-20px',
	'24': '-24px',
	'28': '-28px',
	'32': '-32px',
	'36': '-36px',
	'40': '-40px',
	'44': '-44px',
	'48': '-48px',
} as const

export const negativeMargins = {
	mobile: styleVariants(negativeMarginValues, (value) => ({
		marginLeft: value,
		marginTop: value,
	})),
	tablet: styleVariants(negativeMarginValues, (value) => ({
		'@media': {
			[mediaQueries.tablet['@media']]: {
				marginLeft: value,
				marginTop: value,
			},
		},
	})),
	desktop: styleVariants(negativeMarginValues, (value) => ({
		'@media': {
			[mediaQueries.desktop['@media']]: {
				marginLeft: value,
				marginTop: value,
			},
		},
	})),
	wide: styleVariants(negativeMarginValues, (value) => ({
		'@media': {
			[mediaQueries.wide['@media']]: {
				marginLeft: value,
				marginTop: value,
			},
		},
	})),
} as const

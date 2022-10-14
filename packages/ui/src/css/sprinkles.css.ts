import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles'
import colors from './colors'
import space from './spaces'

const responsiveProperties = defineProperties({
	conditions: {
		mobile: {},
		tablet: { '@media': 'screen and (min-width: 768px)' },
		desktop: { '@media': 'screen and (min-width: 1024px)' },
	},
	defaultCondition: 'mobile',
	properties: {
		display: ['none', 'flex', 'block', 'inline'],
		flexDirection: ['row', 'column'],
		justifyContent: [
			'stretch',
			'flex-start',
			'center',
			'flex-end',
			'space-around',
			'space-between',
		],
		alignItems: ['stretch', 'flex-start', 'center', 'flex-end'],
		paddingTop: space,
		paddingBottom: space,
		paddingLeft: space,
		paddingRight: space,
	},
	shorthands: {
		p: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
		padding: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
		pX: ['paddingLeft', 'paddingRight'],
		paddingX: ['paddingLeft', 'paddingRight'],
		pY: ['paddingTop', 'paddingBottom'],
		paddingY: ['paddingTop', 'paddingBottom'],
		placeItems: ['justifyContent', 'alignItems'],
	},
})

const colorProperties = defineProperties({
	conditions: {
		lightMode: {},
		darkMode: { '@media': '(prefers-color-scheme: dark)' },
	},
	defaultCondition: 'lightMode',
	properties: {
		color: colors,
		background: colors,
	},
})

export const sprinkles = createSprinkles(responsiveProperties, colorProperties)

export type Sprinkles = Parameters<typeof sprinkles>[0]

import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles'
import { borders } from './borders'
import { breakpoints } from './breakpoints'
import { vars } from './theme.css'

const responsiveProperties = defineProperties({
	conditions: {
		mobile: {},
		tablet: {
			'@media': `screen and (min-width: ${breakpoints.tablet})`,
		},
		desktop: {
			'@media': `screen and (min-width: ${breakpoints.desktop})`,
		},
		wide: { '@media': `screen and (min-width: ${breakpoints.wide})` },
	},
	defaultCondition: 'mobile',
	properties: {
		alignItems: ['stretch', 'flex-start', 'center', 'flex-end'],
		borderRadius: vars.borderRadius,
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
		padding: vars.space,
		paddingTop: vars.space,
		paddingBottom: vars.space,
		paddingLeft: vars.space,
		paddingRight: vars.space,
		margin: vars.space,
		marginTop: vars.space,
		marginBottom: vars.space,
		marginLeft: vars.space,
		marginRight: vars.space,
	},
	shorthands: {
		// border: ['borderTop', 'borderRight', 'borderBottom', 'borderLeft'],
		p: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
		px: ['paddingLeft', 'paddingRight'],
		py: ['paddingTop', 'paddingBottom'],
		m: ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'],
		mx: ['marginLeft', 'marginRight'],
		my: ['marginTop', 'marginBottom'],
	},
})

const colorProperties = defineProperties({
	conditions: {
		lightMode: {},
		darkMode: { '@media': '(prefers-color-scheme: dark)' },
	},
	defaultCondition: 'lightMode',
	properties: {
		background: vars.color,
		border: borders,
		borderTop: borders,
		borderRight: borders,
		borderBottom: borders,
		borderLeft: borders,
		borderColor: vars.color,
		borderStyle: ['hidden', 'solid'],
		borderWidth: vars.border.width,
		boxShadow: vars.shadows,
		color: vars.color,
	},
})

export const sprinkles = createSprinkles(responsiveProperties, colorProperties)

export type Sprinkles = Parameters<typeof sprinkles>[0]

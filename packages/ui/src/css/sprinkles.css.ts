import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles'
import { breakpoints } from './breakpoints'
import { vars } from './theme.css'

const responsiveProperties = defineProperties({
	conditions: {
		mobile: {},
		tablet: {
			'@media': `screen and (min-width: ${vars.breakpoint.tablet})`,
		},
		desktop: {
			'@media': `screen and (min-width: ${vars.breakpoint.desktop})`,
		},
		wide: { '@media': `screen and (min-width: ${vars.breakpoint.wide})` },
	},
	defaultCondition: 'mobile',
	properties: {
		alignItems: ['stretch', 'flex-start', 'center', 'flex-end'],
		borderRadius: vars.border.radius,
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
		borderColor: vars.color,
		boxShadow: vars.shadows,
		color: vars.color,
	},
})

export const sprinkles = createSprinkles(responsiveProperties, colorProperties)

export type Sprinkles = Parameters<typeof sprinkles>[0]

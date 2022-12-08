import {
	defineProperties,
	createSprinkles,
	createMapValueFn,
} from '@vanilla-extract/sprinkles'
import { borders } from './borders'
import { Breakpoint, mediaQueries } from './breakpoints'
import { colors } from './colors'
import { vars } from './vars'

const responsiveProperties = defineProperties({
	conditions: mediaQueries,
	defaultCondition: 'mobile',
	properties: {
		alignItems: ['stretch', 'flex-start', 'center', 'flex-end'],
		borderRadius: vars.borderRadius,
		borderTopLeftRadius: vars.borderRadius,
		borderTopRightRadius: vars.borderRadius,
		borderBottomLeftRadius: vars.borderRadius,
		borderBottomRightRadius: vars.borderRadius,
		display: [
			'none',
			'flex',
			'block',
			'inline',
			'inline-block',
			'inline-flex',
		],
		position: ['absolute', 'fixed', 'relative', 'static', 'sticky'],
		gap: vars.space,
		flex: {
			stretch: '1 1 0',
			fixed: '0 0 auto',
		},
		flexDirection: ['row', 'column'],
		flexGrow: [0, 1],
		flexShrink: [0],
		flexWrap: ['wrap', 'nowrap'],
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
		margin: vars.margin,
		marginTop: vars.margin,
		marginBottom: vars.margin,
		marginLeft: vars.margin,
		marginRight: vars.margin,
		width: {
			full: '100%',
		},
		maxWidth: {
			full: '100%',
		},
	},
	shorthands: {
		align: ['alignItems'],
		btr: ['borderTopLeftRadius', 'borderTopRightRadius'],
		bbr: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
		brr: ['borderTopRightRadius', 'borderBottomRightRadius'],
		blr: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
		p: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
		px: ['paddingLeft', 'paddingRight'],
		py: ['paddingTop', 'paddingBottom'],
		pt: ['paddingTop'],
		pr: ['paddingRight'],
		pb: ['paddingBottom'],
		pl: ['paddingLeft'],
		m: ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'],
		mx: ['marginLeft', 'marginRight'],
		my: ['marginTop', 'marginBottom'],
		mt: ['marginTop'],
		mr: ['marginRight'],
		mb: ['marginBottom'],
		ml: ['marginLeft'],
	},
})

const staticProperties = defineProperties({
	properties: {
		visibility: ['hidden', 'visible'],
		cursor: ['default', 'pointer'],
		textTransform: [
			'none',
			'capitalize',
			'uppercase',
			'lowercase',
			'full-width',
			'full-size-kana',
		],
		userSelect: ['all', 'auto', 'none'],
		overflow: vars.overflow,
		overflowX: vars.overflow,
		overflowY: vars.overflow,
	},
})

const colorProperties = defineProperties({
	conditions: {
		lightMode: {},
		darkMode: { '@media': '(prefers-color-scheme: dark)' },
	},
	defaultCondition: 'lightMode',
	properties: {
		backgroundColor: vars.color,
		border: borders,
		borderTop: borders,
		borderRight: borders,
		borderBottom: borders,
		borderLeft: borders,
		borderColor: colors,
		borderStyle: ['hidden', 'solid'],
		borderWidth: vars.borderWidth,
		boxShadow: vars.shadows,
		color: vars.color,
		textTransform: ['none', 'capitalize', 'uppercase', 'lowercase'],
	},
	shorthands: {
		background: ['backgroundColor'],
		border: ['borderTop', 'borderRight', 'borderBottom', 'borderLeft'],
		bt: ['borderTop'],
		br: ['borderRight'],
		bb: ['borderBottom'],
		bl: ['borderLeft'],
		shadow: ['boxShadow'],
	},
})

export const sprinkles = createSprinkles(
	responsiveProperties,
	colorProperties,
	staticProperties,
)

export type Sprinkles = Parameters<typeof sprinkles>[0]

export const mapResponsiveValue = createMapValueFn(responsiveProperties)

export type OptionalResponsiveObject<Value> =
	| Value
	| Partial<Record<Breakpoint, Value>>

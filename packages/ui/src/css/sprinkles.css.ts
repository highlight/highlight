import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles'
import { borders } from './borders'
import { backgroundColors, borderColors, textColors } from './colors'
import { vars } from './vars'
import { mediaQueries } from './breakpoints'

const staticProperties = defineProperties({
	properties: {
		alignItems: ['stretch', 'flex-start', 'center', 'flex-end'],
		borderRadius: vars.borderRadius,
		borderTopLeftRadius: vars.borderRadius,
		borderTopRightRadius: vars.borderRadius,
		borderBottomLeftRadius: vars.borderRadius,
		borderBottomRightRadius: vars.borderRadius,
		cursor: ['default', 'pointer', 'not-allowed'],
		display: [
			'none',
			'flex',
			'block',
			'inline',
			'inline-block',
			'inline-flex',
		],
		position: ['absolute', 'fixed', 'relative', 'static', 'sticky'],
		textAlign: ['left', 'center', 'right'],
		flex: {
			stretch: '1 1 0',
			fixed: '0 0 auto',
		},
		flexBasis: [0, 1],
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
		justifySelf: [
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
		height: {
			full: '100%',
			screen: '100vh',
		},
		width: {
			full: '100%',
			screen: '100vw',
		},
		maxHeight: {
			full: '100%',
			screen: '100vh',
		},
		maxWidth: {
			full: '100%',
			screen: '100vw',
		},
		minHeight: {
			full: '100%',
			screen: '100vh',
		},
		minWidth: {
			full: '100%',
			screen: '100vw',
		},
		overflow: vars.overflow,
		overflowX: vars.overflow,
		overflowY: vars.overflow,
		overflowWrap: {
			normal: 'normal',
			breakWord: 'break-word',
		},
		textTransform: [
			'none',
			'capitalize',
			'uppercase',
			'lowercase',
			'full-width',
			'full-size-kana',
		],
		userSelect: ['all', 'auto', 'none'],
		visibility: ['hidden', 'visible'],
		whiteSpace: ['normal', 'nowrap'],
		wordBreak: ['normal', 'break-all', 'break-word'],
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
		ow: ['overflowWrap'],
	},
})

const colorProperties = defineProperties({
	conditions: {
		default: {},
		hover: { selector: '&:hover' },
	},
	defaultCondition: 'default',
	properties: {
		backgroundColor: backgroundColors,
		border: borders,
		borderTop: borders,
		borderRight: borders,
		borderBottom: borders,
		borderLeft: borders,
		borderColor: borderColors,
		borderStyle: ['hidden', 'solid'],
		borderWidth: vars.borderWidth,
		boxShadow: vars.shadows,
		color: textColors,
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

const responsiveProperties = defineProperties({
	conditions: mediaQueries,
	defaultCondition: 'mobile',
	properties: {
		flexDirection: ['row', 'column', 'column-reverse'],
		gap: vars.space,
	},
})

export const sprinkles = createSprinkles(
	colorProperties,
	staticProperties,
	responsiveProperties,
)

export type Sprinkles = Parameters<typeof sprinkles>[0]

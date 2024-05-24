import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles'

import { borders } from './borders'
import { mediaQueries } from './breakpoints'
import { colors } from './colors'
import { vars } from './vars'

export const textColors = {
	...colors,
	default: vars.theme.static.content.default,
	moderate: vars.theme.static.content.moderate,
	strong: vars.theme.static.content.strong,
	bad: vars.theme.static.content.sentiment.bad,
	good: vars.theme.static.content.sentiment.good,
	caution: vars.theme.static.content.sentiment.caution,
	informative: vars.theme.static.content.sentiment.informative,
	weak: vars.theme.static.content.weak,
	primaryEnabled: vars.theme.interactive.fill.primary.enabled,
	primaryHover: vars.theme.interactive.fill.primary.hover,
	primaryPressed: vars.theme.interactive.fill.primary.pressed,
	primaryDisabled: vars.theme.interactive.fill.primary.disabled,
	primaryContentOnEnabled:
		vars.theme.interactive.fill.primary.content.onEnabled,
	primaryContentOnDisabled:
		vars.theme.interactive.fill.primary.content.onDisabled,
	primaryContentText: vars.theme.interactive.fill.primary.content.text,
	secondaryEnabled: vars.theme.interactive.fill.secondary.enabled,
	secondaryHover: vars.theme.interactive.fill.secondary.hover,
	secondaryPressed: vars.theme.interactive.fill.secondary.pressed,
	secondaryDisabled: vars.theme.interactive.fill.secondary.disabled,
	secondaryContentOnEnabled:
		vars.theme.interactive.fill.secondary.content.onEnabled,
	secondaryContentOnDisabled:
		vars.theme.interactive.fill.secondary.content.onDisabled,
	secondaryContentText: vars.theme.interactive.fill.secondary.content.text,
} as const

export const backgroundColors = {
	...colors,
	nested: vars.theme.static.surface.nested,
	default: vars.theme.static.surface.default,
	raised: vars.theme.static.surface.raised,
	elevated: vars.theme.static.surface.elevated,
	scrim: vars.theme.static.surface.scrim,
	good: vars.theme.static.surface.sentiment.good,
	informative: vars.theme.static.surface.sentiment.informative,
	caution: vars.theme.static.surface.sentiment.caution,
	contentModerate: vars.theme.static.content.moderate,
	contentStrong: vars.theme.static.content.strong,
	contentBad: vars.theme.static.content.sentiment.bad,
	contentGood: vars.theme.static.content.sentiment.good,
	contentCaution: vars.theme.static.content.sentiment.caution,
	contentInformative: vars.theme.static.content.sentiment.informative,
	weak: vars.theme.static.content.weak,
	secondaryDisabled: vars.theme.interactive.overlay.secondary.disabled,
	secondaryEnabled: vars.theme.interactive.overlay.secondary.enabled,
	secondaryHover: vars.theme.interactive.overlay.secondary.hover,
	secondaryPressed: vars.theme.interactive.overlay.secondary.pressed,
	secondarySelected:
		vars.theme.interactive.overlay.secondary.selected.default,
	secondarySelectedHover:
		vars.theme.interactive.overlay.secondary.selected.hover,
	surfaceNeutral: vars.theme.static.surface.sentiment.neutral,
	primaryDisabled: vars.theme.interactive.overlay.primary.disabled,
	primaryEnabled: vars.theme.interactive.overlay.primary.enabled,
	primaryHover: vars.theme.interactive.overlay.primary.hover,
	primaryPressed: vars.theme.interactive.overlay.primary.pressed,
} as const

const staticProperties = defineProperties({
	properties: {
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
		textDecoration: ['none', 'underline', 'line-through'],
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
		borderColor: colors,
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
		alignItems: ['stretch', 'flex-start', 'center', 'flex-end'],
		alignSelf: ['stretch', 'flex-start', 'center', 'flex-end'],
		flexDirection: ['row', 'column', 'column-reverse'],
		gap: vars.space,
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
	},
	shorthands: {
		align: ['alignItems'],
	},
})

export const sprinkles = createSprinkles(
	colorProperties,
	staticProperties,
	responsiveProperties,
)

export type Sprinkles = Parameters<typeof sprinkles>[0]

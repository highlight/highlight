import { sprinkles } from '@highlight-run/ui/sprinkles'
import { themeVars } from '@highlight-run/ui/theme'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

import { styledVerticalScrollbar } from '@/style/common.css'

export const sidebarScroll = style([
	sprinkles({
		overflowY: 'auto',
		overflowX: 'hidden',
		height: 'full',
	}),
	styledVerticalScrollbar,
	{
		width: 240,
		flexShrink: 0,
		borderRight: vars.border.secondary,
	},
])

export const menuTitle = style({
	padding: '16px 12px 6px 12px',
	textTransform: 'uppercase',
	letterSpacing: '0.04em',
	fontSize: 11,
	fontWeight: 600,
	color: themeVars.static.content.weak,
})

export const menuItem = style({
	borderRadius: 6,
	color: themeVars.interactive.fill.secondary.content.text,
	cursor: 'pointer',
	padding: '6px 12px',
	margin: '1px 0',
	display: 'flex',
	alignItems: 'center',
	gap: 10,
	textDecoration: 'none',
	transition: 'background-color 0.15s ease',
	selectors: {
		'&:hover': {
			backgroundColor: themeVars.interactive.overlay.secondary.hover,
		},
	},
})

export const menuItemActive = style({
	backgroundColor: themeVars.interactive.overlay.secondary.pressed,
	color: themeVars.interactive.fill.secondary.content.onEnabled,
})

export const detailPanel = style([
	sprinkles({
		flexGrow: 1,
		backgroundColor: 'white',
		height: 'full',
		overflowY: 'auto',
	}),
])

export const detailTopBar = style({
	padding: '12px 24px',
	borderBottom: vars.border.secondary,
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
})

export const detailHeader = style({
	padding: '24px 32px 20px 32px',
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'flex-start',
})

export const metadataRow = style({
	padding: '0 32px',
	marginBottom: 20,
})

export const metadataBox = style({
	border: vars.border.secondary,
	borderRadius: 8,
	padding: '12px 16px',
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
})

export const metadataLabel = style({
	fontSize: 11,
	fontWeight: 500,
	color: themeVars.static.content.weak,
	marginBottom: 2,
})

export const metadataValue = style({
	fontSize: 13,
	fontWeight: 500,
	color: themeVars.static.content.default,
})

export const tabBar = style({
	padding: '0 32px',
	borderBottom: vars.border.secondary,
	display: 'flex',
	gap: 0,
})

export const tab = style({
	padding: '10px 16px',
	fontSize: 13,
	fontWeight: 500,
	color: themeVars.static.content.weak,
	cursor: 'pointer',
	borderBottom: '2px solid transparent',
	transition: 'color 0.15s ease, border-color 0.15s ease',
	background: 'none',
	border: 'none',
	selectors: {
		'&:hover': {
			color: themeVars.static.content.default,
		},
	},
})

export const tabActive = style({
	color: themeVars.static.content.default,
	borderBottomColor: themeVars.interactive.fill.primary.enabled,
	borderBottomWidth: 2,
	borderBottomStyle: 'solid',
})

export const detailContent = style({
	padding: '24px 32px',
})

export const logo = style({
	height: 32,
	width: 32,
	borderRadius: 6,
	objectFit: 'contain',
})

export const externalLink = style({
	fontSize: 13,
	fontWeight: 500,
	color: themeVars.static.content.moderate,
	textDecoration: 'none',
	display: 'flex',
	alignItems: 'center',
	gap: 4,
	selectors: {
		'&:hover': {
			color: themeVars.static.content.default,
		},
	},
})

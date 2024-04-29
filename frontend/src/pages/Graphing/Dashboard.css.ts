import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

export const editGraphHeader = style({
	height: 40,
})

export const dashboardContent = style({
	height: 'calc(100% - 40px)',
})

export const headerDivider = style({
	width: 1,
	backgroundColor: vars.theme.static.divider.weak,
	margin: '4px 2px',
})

export const graphBackground = style({
	zIndex: 0,
})

export const editGraphSidebar = style({
	width: 320,
})

export const editorLabel = style({
	marginBottom: 4,
})

export const menuButton = style({
	border: vars.border.divider,
	width: '100%',
})

export const input = style({
	height: 28,
})

export const graphGrid = style({
	overflow: 'auto',
	display: 'grid',
	width: '100%',
	height: '100%',
	padding: '8px 28px',
	gridTemplateRows: 'repeat(auto-fill, 280px)',

	'@media': {
		[`(width <= 850px)`]: {
			gridTemplateColumns: '1fr',
		},
		[`(850px < width <= 1250px)`]: {
			gridTemplateColumns: '1fr 1fr',
		},
		[`(1250px < width)`]: {
			gridTemplateColumns: '1fr 1fr 1fr',
		},
	},
})

export const gridEditing = style({
	backgroundColor: vars.theme.static.surface.raised,
})

globalStyle(`${menuButton} > div`, {
	width: '100%',
})

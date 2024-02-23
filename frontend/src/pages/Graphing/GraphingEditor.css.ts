import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

export const editGraphHeader = style({
	height: 40,
})

export const graphWrapper = style({
	width: 720,
	height: 360,
	margin: 'auto',
	zIndex: 1,
	backgroundColor: '#fff',
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

globalStyle(`${menuButton} > div`, {
	width: '100%',
})

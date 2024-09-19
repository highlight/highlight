import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const editGraphHeader = style({
	height: 40,
})

export const editGraphPanel = style({
	height: 'calc(100% - 40px)',
})

export const previewWindow = style({
	width: 'calc(100%)',
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

export const input = style({
	height: 28,
})

export const graphWrapper = style({
	width: 860,
	height: 540,
	margin: 'auto',
	zIndex: 1,
	backgroundColor: vars.color.white,
})

export const tagSwitch = style({
	width: '100%',
})

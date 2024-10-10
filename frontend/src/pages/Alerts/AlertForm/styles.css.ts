import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const editGraphHeader = style({
	height: 40,
})

export const editGraphPanel = style({
	height: 'calc(100% - 40px)',
})

export const tagSwitch = style({
	width: '100%',
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

export const previewWindow = style({
	width: 'calc(100% - 320px)',
})

export const graphBackground = style({
	zIndex: 0,
})

export const graphContainer = style({
	margin: 'auto',
	zIndex: 1,
	backgroundColor: vars.color.white,
})

import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const editGraphHeader = style({
	height: 40,
})

export const editGraphPanel = style({
	height: 'calc(100% - 40px)',
})

export const editGraphPreview = style({
	flexGrow: 1,
})

export const graphBackground = style({
	zIndex: 0,
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

export const editorHeader = style({
	display: 'flex',
	justifyContent: 'space-between',
	width: '100%',
	borderBottom: vars.border.divider,
	padding: '6px',
})

export const editorSelect = style({
	width: 'fit-content',
})

export const editorSection = style({
	border: vars.border.divider,
	borderRadius: vars.borderRadius[6],
})

export const sqlEditorWrapper = style({
	backgroundColor: vars.theme.static.surface.nested,
	borderBottomLeftRadius: vars.borderRadius[6],
	borderBottomRightRadius: vars.borderRadius[6],
})

import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

export const editorWrapper = style({
	width: '100%',
})

export const errorMessages = style({
	maxHeight: '100px',
	overflow: 'auto',
	padding: '8px 0',
})

export const statusTitle = style({
	height: '28px',
	justifyContent: 'center',
	borderTop: vars.border.divider,
	borderBottom: vars.border.divider,
})

globalStyle(`${editorWrapper} .cm-focused`, {
	outline: 'initial',
})

globalStyle(`${editorWrapper} .cm-tooltip`, {
	maxWidth: '400px',
	borderRadius: vars.borderRadius[6],
	backgroundColor: vars.theme.static.surface.default,
	border: vars.border.divider,
	overflow: 'hidden',
})

globalStyle(`${editorWrapper} .cm-diagnosticText`, {
	color: '#383a42',
})

globalStyle(`${editorWrapper} .cm-tooltip-autocomplete ul li`, {
	fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
	color: '#383a42',
})

globalStyle(`${editorWrapper} .cm-tooltip-autocomplete ul li[aria-selected]`, {
	backgroundColor: vars.theme.interactive.overlay.secondary.hover,
	color: '#383a42',
})

globalStyle(`${editorWrapper} .cm-completionIcon`, {
	display: 'none',
})

import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '@highlight-run/ui/vars'

export const editorWrapper = style({
	width: '100%',
	backgroundColor: vars.theme.static.surface.nested,
	border: vars.border.divider,
	borderRadius: vars.borderRadius[6],
})

globalStyle(`${editorWrapper} .cm-focused`, {
	outline: 'initial',
})

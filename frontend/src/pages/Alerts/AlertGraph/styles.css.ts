import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const previewWindow = style({
	width: 'calc(100% - 320px)',
})

export const graphBackground = style({
	zIndex: 0,
})

export const graphWrapper = style({
	width: 720,
	height: 360,
	margin: 'auto',
	zIndex: 1,
	backgroundColor: vars.color.white,
})

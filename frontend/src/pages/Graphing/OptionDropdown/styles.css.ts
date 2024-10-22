import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

export const menuButton = style({
	border: vars.border.divider,
	width: '100%',
	flex: 1,
})

export const menuButtonInner = style({
	height: '24px',
})

globalStyle(`${menuButton} > div`, {
	width: '100%',
})

export const menuList = style({
	maxHeight: '300px',
	overflowY: 'auto',
})

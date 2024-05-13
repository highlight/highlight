import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const comboboxWrapper = style({
	width: '100%',
	height: '100%',
})

export const combobox = style({
	padding: '0',
	width: '100%',
	height: '20px',
	borderRadius: '0',
	border: 'none',
	background: 'none',
})

export const comboboxText = style({
	height: '20px',
})

export const disabled = style({
	color: vars.theme.interactive.fill.secondary.content.onDisabled,
})

export const menuButton = style({
	padding: 0,
	width: '100%',
	height: '20px',
})

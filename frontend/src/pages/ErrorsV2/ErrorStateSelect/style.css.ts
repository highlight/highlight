import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

export const datepicker = style({
	border: vars.border.secondary,
	padding: '4px 6px',
	fontSize: 13,
	width: '100%',
	selectors: {
		'&:hover': {
			border: vars.border.secondaryHover,
		},
	},
})

globalStyle(`${datepicker} .ant-picker-input input`, {
	fontSize: 13,
})

globalStyle(`${datepicker}.ant-picker-focused`, {
	border: vars.border.secondaryPressed,
	boxShadow: 'none',
})

export const menu = style({
	zIndex: 1,
})

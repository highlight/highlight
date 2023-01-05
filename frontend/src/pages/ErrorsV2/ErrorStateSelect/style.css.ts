import { globalStyle, style } from '@vanilla-extract/css'

export const datepicker = style({
	border: 0,
	height: 0,
})

export const datepickerInput = globalStyle(`${datepicker} .ant-picker-input`, {
	display: 'none',
})

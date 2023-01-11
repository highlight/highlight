import { style } from '@vanilla-extract/css'

export const container = style({
	display: 'flex',
	flexDirection: 'column',
	height: '100%',
	width: '100%',
})

export const sessionSwitchButton = style({
	border: 'none !important',
})

export const sessionSwitchButtonLeft = style({
	borderRadius: `6px 0px 0px 6px`,
})

export const sessionSwitchButtonRight = style({
	borderRadius: `0px 6px 6px 0px`,
})

export const overflowText = style({
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	lineHeight: '20px',
})

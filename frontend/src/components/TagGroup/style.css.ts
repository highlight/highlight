import { globalStyle, style } from '@vanilla-extract/css'

export const tagLink = style({
	display: 'inline-block',
})

globalStyle(`${tagLink}:first-of-type > button`, {
	borderRight: 'none',
})

globalStyle(`${tagLink}:last-of-type > button`, {
	borderLeft: 'none',
})

import { style } from '@vanilla-extract/css'

export const inputLabel = style({
	color: "#908e96",
	fontSize: 11,
	fontWeight: "500",
	marginBottom: 6,
})

export const input = style({
	backgroundColor: "white",
	border: "1px solid #dcdbdd",
	borderRadius: 6,
	fontSize: 13,
	height: 28,
	padding: "4px 6px",
	width: "100%",
	selectors: {
		'&:focus, &:active, &::selection': {
		border: "1px solid #c9b9f3",
		outline: 0
		},
	},
})
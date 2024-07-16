import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

export const selectContainer = style({
	color: `${vars.theme.static.content.default} !important`,
	width: '100%',
	selectors: {
		'&:hover': {
			background: vars.theme.interactive.overlay.secondary.hover,
		},
	},
})

globalStyle(`${selectContainer} .ant-select-selector`, {
	padding: `0 6px !important`,
	borderRadius: `6px !important`,
	border: `${vars.border.secondary} !important`,
	boxShadow: 'none !important',
})

globalStyle(`${selectContainer} .ant-select-selector:hover`, {
	background: `${vars.theme.interactive.overlay.secondary.hover} !important`,
})

globalStyle(`${selectContainer} .ant-select-selection-item`, {
	display: 'flex',
	alignItems: 'center',
})

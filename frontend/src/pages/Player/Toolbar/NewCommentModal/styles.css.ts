import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

export const modalContainer = style({})

globalStyle(`${modalContainer} .ant-modal-content`, {
	backgroundColor: vars.theme.static.surface.raised,
	borderRadius: `${vars.borderRadius[8]} !important`,
	border: vars.border.divider,
	boxShadow: vars.shadows.medium,
})

globalStyle(`${modalContainer} .ant-modal-body`, {
	padding: 0,
})

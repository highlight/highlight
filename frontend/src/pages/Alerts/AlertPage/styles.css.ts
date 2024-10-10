import { style } from '@vanilla-extract/css'

const TOPBAR_HEIGHT = 40

export const alertTopbar = style({
	height: TOPBAR_HEIGHT,
})

export const alertContainer = style({
	height: `calc(100% - ${TOPBAR_HEIGHT}px)`,
	margin: '24px auto 12px',
})

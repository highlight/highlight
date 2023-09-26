import { colors } from '@highlight-run/ui/src/css/colors'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import { style } from '@vanilla-extract/css'

export const zoomArea = style({
	alignItems: 'center',
	backgroundColor: themeVars.interactive.outline.secondary.enabled,
	borderRadius: 40,
	bottom: 0,
	display: 'flex',
	height: '100%',
	justifyContent: 'space-between',
	opacity: 0.8,
	position: 'absolute',
	zIndex: 2,
})

export const zoomAreaDraggable = style({
	cursor: 'grab',
})

export const zoomAreaSide = style({
	backgroundColor: themeVars.static.divider.strong,
	borderRadius: 40,
	cursor: 'ew-resize',
	display: 'flex',
	flexDirection: 'column',
	height: '100%',
	justifyContent: 'center',
	padding: '0 2px',
	userSelect: 'none',
})

export const zoomAreaHandle = style({
	backgroundColor: colors.white,
	borderRadius: 3,
	height: '50%',
	userSelect: 'none',
	width: 3,
})

export const zoomAreaPanSpace = style({
	height: '100%',
	width: '100%',
})

export const animated = style({
	transition: 'width 0.17s linear',
})

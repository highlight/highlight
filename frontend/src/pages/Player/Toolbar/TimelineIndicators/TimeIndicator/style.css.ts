import {
	HISTOGRAM_AREA_HEIGHT,
	TIME_AXIS_HEIGHT,
} from '@pages/Player/Toolbar/TimelineIndicators/TimelineIndicatorsBarGraph/style.css'
import { style } from '@vanilla-extract/css'

const TOP_HEIGHT = 12

export const timeIndicator = style({
	alignItems: 'center',
	bottom: '0',
	display: 'flex',
	flexDirection: 'column',
	height: '100%',
	position: 'absolute',
	zIndex: '2',
})

export const timeIndicatorMoving = style({
	transition: 'left 0.17s linear',
})

export const timeIndicatorHair = style({
	borderLeft: '2px var(--color-neutral-900) solid',
	cursor: 'ew-resize',
	height: HISTOGRAM_AREA_HEIGHT + 1,
	position: 'absolute',
	top: TIME_AXIS_HEIGHT,
})

export const timeIndicatorHidden = style({
	height: '0',
	visibility: 'hidden',
})

export const timeIndicatorTop = style({
	backgroundColor: 'var(--color-neutral-900)',
	border: '1px solid var(--color-white)',
	borderRadius: '1px 1px 12px 12px',
	cursor: 'grab',
	height: TOP_HEIGHT,
	position: 'sticky',
	top: TIME_AXIS_HEIGHT - TOP_HEIGHT + 1,
	width: '8px',
})

export const timeIndicatorText = style({
	backgroundColor: 'var(--color-neutral-800)',
	borderRadius: '10px',
	color: 'var(--color-neutral-200)',
	fontFamily: 'var(--header-font-family)',
	fontSize: '12px',
	fontWeight: '400',
	padding: '2px 8px',
	position: 'fixed',
	userSelect: 'none',
})

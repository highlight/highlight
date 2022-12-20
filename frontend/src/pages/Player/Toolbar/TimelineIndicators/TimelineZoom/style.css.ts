import { colors } from '@highlight-run/ui/src/css/colors'
import {
	PROGRESS_BAR_HEIGHT,
	SEPARATOR_HEIGHT,
	SESSION_MONITOR_HEIGHT,
	TIME_AXIS_HEIGHT,
} from '@pages/Player/Toolbar/TimelineIndicators/TimelineIndicatorsBarGraph/style.css'
import { style } from '@vanilla-extract/css'

export const zoomButtons = style({
	position: 'absolute',
	right: 4,
	top:
		TIME_AXIS_HEIGHT +
		SESSION_MONITOR_HEIGHT +
		PROGRESS_BAR_HEIGHT +
		SEPARATOR_HEIGHT +
		4,
	zIndex: 6,
	display: 'flex',
	flexDirection: 'row',
	borderRadius: 5,
	overflow: 'hidden',
	justifyContent: 'center',
	alignItems: 'center',
	background: colors.white,
})

export const zoomButtonsInner = style({
	height: '20px !important',
})

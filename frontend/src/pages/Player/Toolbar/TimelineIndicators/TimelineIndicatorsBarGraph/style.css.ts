import { vars } from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const HISTOGRAM_AREA_HEIGHT = 58
export const HISTOGRAM_OFFSET = 26
export const PROGRESS_BAR_HEIGHT = 3
export const SEPARATOR_HEIGHT = 1
export const SESSION_MONITOR_HEIGHT = 7
export const TIME_AXIS_HEIGHT = 24
export const TIME_INDICATOR_TOP_WIDTH = 10
export const TIME_INDICATOR_TOP_HEIGHT = 10
export const TIME_INDICATOR_TEXT_HEIGHT = 20
export const TIMELINE_MARGIN = 8

export const timelineContainer = style({
	alignItems: 'center',
	backgroundColor: colors.white,
	display: 'flex',
	flexDirection: 'column',
	zIndex: 5,
	position: 'relative',
})

export const sessionMonitor = style({
	borderBottom: '1px var(--color-neutral-100) solid',
	height: SESSION_MONITOR_HEIGHT,
	overflow: 'hidden',
	position: 'relative',
	width: '100%',
	zIndex: 2,
})

export const hidden = style({
	border: '0 !important',
	height: '0 !important',
	overflowX: 'hidden',
	visibility: 'hidden',
})

export const hideOverflow = style({
	overflow: 'hidden !important',
})

export const noPointerEvents = style({
	pointerEvents: 'none',
})

export const progressBarContainer = style({
	backgroundColor: 'var(--color-neutral-300)',
	borderBottom: '1px solid var(--color-neutral-100)',
	borderRadius: '1px 1px 0 0',
	height: PROGRESS_BAR_HEIGHT,
	overflow: 'hidden',
	position: 'relative',
	width: '100%',
	zIndex: '1',
})

export const progressBar = style({
	willChange: 'transform',
	backgroundColor: 'var(--color-neutral-700)',
	height: PROGRESS_BAR_HEIGHT,
	left: 0,
	position: 'absolute',
	top: 0,
	width: '100%',
	transformOrigin: 'left',
})

export const inactivityPeriod = style({
	backgroundColor: 'var(--color-white)',
	height: PROGRESS_BAR_HEIGHT,
	position: 'absolute',
	top: 0,
	zIndex: 2,
	display: 'flex',
})

export const inactivityPeriodPlayed = style({
	willChange: 'transform',
	backgroundColor: 'var(--color-neutral-500)',
	zIndex: 4,
	width: '100%',
	transformOrigin: 'left',
})

export const viewportContainer = style({
	height: 'min-content',
	overflowX: 'clip',
	overflowY: 'hidden',
	overscrollBehavior: 'none',
	position: 'relative',
	width: '100% !important',
})

export const eventHistogram = style({
	display: 'flex',
	flexDirection: 'column',
	height: HISTOGRAM_AREA_HEIGHT,
	marginLeft: TIMELINE_MARGIN,
	marginRight: TIMELINE_MARGIN,
	position: 'relative',
	justifyContent: 'flex-end',
})

export const eventTrack = style({
	position: 'relative',
	width: '100%',
	height: HISTOGRAM_AREA_HEIGHT,
})

export const timeAxis = style({
	height: TIME_AXIS_HEIGHT,
	marginLeft: TIMELINE_MARGIN,
	marginRight: TIMELINE_MARGIN,
	pointerEvents: 'none',
	position: 'relative',
})

export const separator = style({
	borderBottom: `${SEPARATOR_HEIGHT}px var(--color-neutral-100) solid`,
})

export const bucketMark = style({
	borderLeft: '1px var(--color-neutral-200) solid',
	bottom: '0',
	position: 'absolute',
})

export const timeTickMark = style({
	bottom: '10px',
	color: 'var(--color-neutral-300)',
	fontFamily: 'var(--header-font-family)',
	fontSize: '10px',
	letterSpacing: '-0.1em',
	lineHeight: '12px',
	position: 'absolute',
	textAlign: 'center',
	userSelect: 'none',
})

export const timeTick = style({
	borderLeft: '1px solid var(--color-neutral-200)',
	bottom: 0,
	position: 'absolute',
})

export const timeTickMajor = style({
	height: '8px',
})

export const timeTickMid = style({
	height: '4px',
})

export const timeTickMinor = style({
	height: '2px',
})

export const inactivityPeriodMask = style({
	backgroundColor: 'var(--color-neutral-50)',
	bottom: '0',
	height: '100%',
	position: 'absolute',
	zIndex: -1,
})

export const moveIndicator = style({
	transition: 'transform 0.27s linear',
})

export const timeIndicatorContainerWrapper = style({
	position: 'absolute',
	left: TIMELINE_MARGIN,
	height: '100%',
	bottom: 0,
})

export const timeIndicatorContainer = style({
	willChange: 'transform',
	position: 'relative',
	height: '100%',
	width: TIME_INDICATOR_TOP_WIDTH,
	overflow: 'hidden',
	zIndex: 1,
})

export const timeIndicator = style({
	alignItems: 'center',
	bottom: '0',
	display: 'flex',
	flexDirection: 'column',
	height: '100%',
	width: TIME_INDICATOR_TOP_WIDTH,
	position: 'relative',
	zIndex: '2',
})

export const animated = style({
	transition: 'transform 0.17s linear',
})

export const timeIndicatorHair = style({
	width: 4,
	backgroundColor: vars.theme.static.content.default,
	border: `1px solid ${vars.color.white}`,
	borderTop: 'none',
	cursor: 'ew-resize',
	height: HISTOGRAM_AREA_HEIGHT + 1,
	position: 'absolute',
	top: TIME_AXIS_HEIGHT,
})

export const hairHidden = style({
	height: '0',
	visibility: 'hidden',
})

export const timeIndicatorTop = style({
	backgroundColor: vars.theme.static.content.default,
	border: `1px solid ${vars.color.white}`,
	borderRadius: '1px 1px 12px 12px',
	cursor: 'grab',
	height: TIME_INDICATOR_TOP_HEIGHT,
	position: 'sticky',
	top: TIME_AXIS_HEIGHT - TIME_INDICATOR_TOP_HEIGHT + 1,
	width: 8,
})

export const timeIndicatorText = style({
	zIndex: 2,
	height: TIME_INDICATOR_TEXT_HEIGHT,
	left: 0,
	transformOrigin: 'left',
})

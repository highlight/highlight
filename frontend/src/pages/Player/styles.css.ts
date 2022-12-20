import { shadows } from '@highlight-run/ui/src/components/Button/styles.css'
import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

// we use a margin to have auto resizing of the center container when the left/right panels open/close
// this should be a fairly large number of reduce the number of re-renders needed when the left/right panels open/close.
// `controllerWidth` is updated until this margin is achieved, so the larger the value the fewer re-renders needed.
export const CENTER_COLUMN_OVERLAP = 64
// the negative margin on playerCenterColumn cancels out with the `controllerWidth` to
// set this as the effective margin
export const CENTER_COLUMN_MARGIN = 0
export const PLAYER_PADDING = 8
export const MIN_CENTER_COLUMN_WIDTH = 428
export const PLAYER_PADDING_X = 64
export const PLAYER_PADDING_Y = 64

export const playerWrapperV2 = style({
	borderTop: `solid 1px ${colors.neutralN6}`,
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
})

export const playerCenterPanel = style({
	display: 'flex',
	flexDirection: 'column',
	height: '100%',
	position: 'relative',
	background: colors.neutralN1,
})

export const playerContainer = style({
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
	height: '100%',
	padding: PLAYER_PADDING,
})

export const rrwebPlayerSection = style({
	border: `1px solid ${colors.neutralN6}`,
	borderRadius: 6,
	boxShadow: shadows.medium,
	display: 'flex',
	flex: 2,
	height: '100%',
	width: '100%',
})

export const rrwebPlayerWrapper = style({
	alignItems: 'center',
	boxSizing: 'border-box',
	display: 'flex',
	flexGrow: 1,
	justifyContent: 'center',
	position: 'relative',
	width: '100%',
})

export const rrwebInnerWrapper = style({
	clipPath: `inset(0% 0% 0% 0% round 8px)`,
})

export const playerCenterColumn = style({
	alignItems: 'center',
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
	position: 'relative',
	marginLeft: CENTER_COLUMN_MARGIN - CENTER_COLUMN_OVERLAP,
	marginRight: CENTER_COLUMN_MARGIN - CENTER_COLUMN_OVERLAP,
})

export const playerLeftPanel = style({
	backgroundColor: colors.neutralN1,
	borderRight: `1px solid ${colors.neutralN6}`,
	height: '100%',
	padding: 0,
	position: 'relative',
	top: 0,
	transform: 'translateX(0)',
	transition: 'transform 0.2s ease-in-out',
	width: 340,
	zIndex: 98,
})

export const playerLeftPanelHidden = style({
	position: 'fixed',
	transform: 'translateX(-340px)',
})

export const draggable = style({
	alignItems: 'center',
	color: colors.black,
	cursor: 'move',
	display: 'flex',
	justifyContent: 'flex-end',
	position: 'relative',
	left: 32,
	top: -700,
	zIndex: 200,
})

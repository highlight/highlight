import { borders } from '@highlight-run/ui/borders'
import { colors } from '@highlight-run/ui/colors'
import { vars } from '@highlight-run/ui/vars'
import { RIGHT_PANEL_WIDTH } from '@pages/Player/RightPlayerPanel/style.css'
import { globalStyle, style } from '@vanilla-extract/css'

export const PLAYER_PADDING = 8
export const MIN_CENTER_COLUMN_WIDTH = 428
export const PLAYER_PADDING_X = 64
export const PLAYER_PADDING_Y = 64

export const playerWrapperV2 = style({
	borderTop: `solid 1px ${colors.n6}`,
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
})

export const playerCenterPanel = style({
	display: 'flex',
	flexDirection: 'column',
	position: 'relative',
})

export const playerContainer = style({
	backgroundColor: colors.n2,
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
	height: '100%',
	padding: PLAYER_PADDING,
})

export const rrwebPlayerSection = style({
	background: colors.n1,
	border: vars.border.dividerWeak,
	borderRadius: 6,
	boxShadow: vars.shadows.small,
	overflow: 'clip',
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

globalStyle('.hide-mouse-cursor .replayer-mouse', {
	display: 'none',
})

export const rrwebInnerWrapper = style({})
globalStyle(`${rrwebInnerWrapper} iframe`, {
	borderRadius: 4,
	border: borders.dividerWeak,
	boxShadow: vars.shadows.medium,
})

export const playerCenterColumn = style({
	alignItems: 'center',
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
	position: 'relative',
	minWidth: MIN_CENTER_COLUMN_WIDTH,
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

export const emptySessionCard = style({
	alignSelf: 'center !important',
	height: 'fit-content',
	justifySelf: 'center !important',
})

export const intercomLink = style({
	cursor: 'pointer',
	textDecoration: 'underline',
})

export const playerBody = style({
	display: 'grid',
	gridTemplateColumns: '1fr',
})

export const withRightPanel = style({
	gridTemplateColumns: `1fr ${RIGHT_PANEL_WIDTH}px`,
})

export const blurBackground = style({
	filter: 'blur(4px)',
})

export const panelDragHandle = style({
	cursor: 'col-resize',
	position: 'absolute',
	right: -2,
	top: 0,
	bottom: 0,
	transition: 'background-color 0.3s',
	width: 4,
	zIndex: 1,

	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.outline.primary.pressed,
		},
		'&:focus': {
			backgroundColor: vars.theme.interactive.outline.primary.pressed,
		},
	},
})

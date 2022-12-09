import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

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
	background: colors.neutralN2,
})

export const playerContainer = style({
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
	height: '100%',
})

export const rrwebPlayerSection = style({
	display: 'flex',
	flex: 2,
	width: '100%',
	height: '100%',
})

export const playerCenterColumn = style({
	alignItems: 'center',
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
	position: 'relative',
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

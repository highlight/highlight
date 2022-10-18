import Button from '@components/Button/Button/Button'
import { ReactComponent as ArrowsExpandIcon } from '@icons/Solid/arrows-expand.svg'
import { ReactComponent as ChartBarIcon } from '@icons/Solid/chart-bar.svg'
import { ReactComponent as CogIcon } from '@icons/Solid/cog.svg'
import { ReactComponent as FastForwardIcon } from '@icons/Solid/fast-forward.svg'
import { ReactComponent as PlayIcon } from '@icons/Solid/play.svg'
import { ReactComponent as SkipLeftIcon } from '@icons/Solid/skip-left.svg'
import { ReactComponent as SkipRightIcon } from '@icons/Solid/skip-right.svg'
import { ReactComponent as TerminalIcon } from '@icons/Solid/terminal.svg'
import classNames from 'classnames'

import style from './ToolbarControls.module.scss'
const ToolbarControls = () => {
	return (
		<div className={style.controlContainer}>
			<Button
				className={style.button}
				trackingId="PlayerSkipLeft"
				onClick={() => {}}
			>
				<SkipLeftIcon />
			</Button>
			<Button
				className={style.button}
				trackingId="PlayerPlayPause"
				onClick={() => {}}
			>
				<PlayIcon />
			</Button>
			<Button
				className={style.button}
				trackingId="PlayerSkipRight"
				onClick={() => {}}
			>
				<SkipRightIcon />
			</Button>
			<Button
				className={(style.button, style.smallButton)}
				trackingId="LiveToggle"
				onClick={() => {}}
			>
				Live
			</Button>
			<Button
				className={classNames(
					style.button,
					style.moveRight,
					style.smallButton,
				)}
				trackingId="PlaybackSpeedControl"
				onClick={() => {}}
			>
				1x
			</Button>
			<Button
				className={classNames(style.button, style.minorButton)}
				trackingId="HistogramToggle"
				onClick={() => {}}
			>
				<ChartBarIcon />
			</Button>
			<Button
				className={classNames(style.button, style.minorButton)}
				trackingId="DevToolsToggle"
				onClick={() => {}}
			>
				<TerminalIcon />
			</Button>
			<Button
				className={classNames(style.button, style.minorButton)}
				trackingId="SkipInactiveToggle"
				onClick={() => {}}
			>
				<FastForwardIcon />
			</Button>
			<Button
				className={style.button}
				trackingId="PlayerSettings"
				onClick={() => {}}
			>
				<CogIcon />
			</Button>
			<Button
				className={style.button}
				trackingId="PlayerFullscreen"
				onClick={() => {}}
			>
				<ArrowsExpandIcon />
			</Button>
		</div>
	)
}

export default ToolbarControls

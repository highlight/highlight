import PopoverMenu from '@components/PopoverMenu/PopoverMenu'
import SvgCheckCircleIcon from '@icons/CheckCircleIcon'
import { getFullScreenPopoverGetPopupContainer } from '@pages/Player/context/PlayerUIContext'
import React from 'react'
import { BiMinus } from 'react-icons/bi'
import { BsPlus } from 'react-icons/bs'

import Button from '../../../../components/Button/Button/Button'
import usePlayerConfiguration, {
	PLAYBACK_SPEED_OPTIONS,
} from '../../PlayerHook/utils/usePlayerConfiguration'
import styles from './SpeedControl.module.scss'

interface Props {
	disabled: boolean
}

const SpeedControl = ({ disabled }: Props) => {
	const { playerSpeedIdx, setPlayerSpeedIdx } = usePlayerConfiguration()

	const onHandleSpeedChange = (type: 'DECREMENT' | 'INCREMENT') => {
		const change = type === 'DECREMENT' ? -1 : 1
		setPlayerSpeedIdx(playerSpeedIdx + change)
	}

	return (
		<div className={styles.speedControlContainer}>
			<Button
				trackingId="DecreasePlayerSpeed"
				className={styles.speedButton}
				onClick={() => {
					onHandleSpeedChange('DECREMENT')
				}}
				type="primary"
				disabled={disabled || playerSpeedIdx === 0}
			>
				<BiMinus />
			</Button>
			<PopoverMenu
				getPopupContainer={getFullScreenPopoverGetPopupContainer}
				// This is a range() function that generates a list from `PLAYBACK_MIN_SPEED` to `PLAYBACK_MAX_SPEED` in increments of `1`.
				menuItems={PLAYBACK_SPEED_OPTIONS.map((speedIdx, idx) => ({
					displayName: `${speedIdx}x`,
					action: () => {
						setPlayerSpeedIdx(idx)
					},
					icon:
						playerSpeedIdx === idx ? (
							<SvgCheckCircleIcon className={styles.icon} />
						) : (
							<div className={styles.icon} />
						),
					iconPosition: 'ending',
					active: speedIdx === idx,
				}))}
				buttonTrackingId="SpeedControlMenu"
				buttonContentsOverride={
					<Button
						trackingId="SpeedControlMenu"
						size="small"
						className={styles.shortcutButton}
					>
						<span className={styles.speedText}>
							{PLAYBACK_SPEED_OPTIONS[playerSpeedIdx]}x
						</span>
					</Button>
				}
				header={<h3>Playback Speed</h3>}
			/>
			<Button
				trackingId="IncreasePlayerSpeed"
				className={styles.speedButton}
				type="primary"
				onClick={() => {
					onHandleSpeedChange('INCREMENT')
				}}
				disabled={
					disabled ||
					playerSpeedIdx === PLAYBACK_SPEED_OPTIONS.length - 1
				}
			>
				<BsPlus />
			</Button>
		</div>
	)
}

export default SpeedControl

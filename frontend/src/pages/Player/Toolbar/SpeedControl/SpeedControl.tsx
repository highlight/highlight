import PopoverMenu from '@components/PopoverMenu/PopoverMenu'
import SvgCheckCircleIcon from '@icons/CheckCircleIcon'
import { getFullScreenPopoverGetPopupContainer } from '@pages/Player/context/PlayerUIContext'
import React from 'react'
import { BiMinus } from 'react-icons/bi'
import { BsPlus } from 'react-icons/bs'

import Button from '../../../../components/Button/Button/Button'
import usePlayerConfiguration from '../../PlayerHook/utils/usePlayerConfiguration'
import styles from './SpeedControl.module.scss'

export const PLAYBACK_MIN_SPEED = 0.5
export const PLAYBACK_MAX_SPEED = 8.0
export const PLAYBACK_SPEED_INCREMENT = 0.5

interface Props {
	disabled: boolean
}

const SpeedControl = ({ disabled }: Props) => {
	const { playerSpeed, setPlayerSpeed } = usePlayerConfiguration()

	const onHandleSpeedChange = (type: 'DECREMENT' | 'INCREMENT') => {
		let newSpeed = playerSpeed

		if (type === 'DECREMENT') {
			newSpeed = Math.max(
				PLAYBACK_MIN_SPEED,
				newSpeed - PLAYBACK_SPEED_INCREMENT,
			)
		} else {
			newSpeed = Math.min(
				PLAYBACK_MAX_SPEED,
				newSpeed + PLAYBACK_SPEED_INCREMENT,
			)
		}

		setPlayerSpeed(newSpeed)
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
				disabled={disabled || playerSpeed === PLAYBACK_MIN_SPEED}
			>
				<BiMinus />
			</Button>
			<PopoverMenu
				getPopupContainer={getFullScreenPopoverGetPopupContainer}
				// This is a range() function that generates a list from `PLAYBACK_MIN_SPEED` to `PLAYBACK_MAX_SPEED` in increments of `1`.
				menuItems={[
					0.5,
					...Array.from(
						new Array(
							Math.floor(
								PLAYBACK_MAX_SPEED - PLAYBACK_MIN_SPEED,
							) + 1,
						),
						(_, i) => i + 1,
					),
				].map((speed) => ({
					displayName: `${speed.toFixed(1)}x`,
					action: () => {
						setPlayerSpeed(speed)
					},
					icon:
						playerSpeed === speed ? (
							<SvgCheckCircleIcon className={styles.icon} />
						) : (
							<div className={styles.icon} />
						),
					iconPosition: 'ending',
					active: speed === playerSpeed,
				}))}
				buttonTrackingId="SpeedControlMenu"
				buttonContentsOverride={
					<Button
						trackingId="SpeedControlMenu"
						size="small"
						className={styles.shortcutButton}
					>
						<span className={styles.speedText}>
							{playerSpeed.toFixed(1)}x
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
				disabled={disabled || playerSpeed === PLAYBACK_MAX_SPEED}
			>
				<BsPlus />
			</Button>
		</div>
	)
}

export default SpeedControl

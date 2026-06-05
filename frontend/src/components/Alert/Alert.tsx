import SvgXIcon from '@icons/XIcon'
import analytics from '@util/analytics'
import clsx from 'clsx'
import { useSessionStorage } from 'react-use'

import SvgInformationIcon from '../../static/InformationIcon'
import styles from './Alert.module.css'

export type AlertProps = {
	trackingId: string
	closable?: boolean
	shouldAlwaysShow?: boolean
	description?: React.ReactNode
	type?: 'info' | 'success' | 'warning' | 'error'
	onClose?: () => void
	message?: React.ReactNode
	className?: string
}

const Alert = ({
	trackingId,
	closable,
	shouldAlwaysShow = false,
	type = 'info',
	...props
}: AlertProps) => {
	const [temporarilyHideAlert, setTemporarilyHideAlert] = useSessionStorage(
		`highlightHideAlert-${trackingId}`,
		false,
	)

	if (temporarilyHideAlert && !shouldAlwaysShow) {
		return null
	}

	const isClosable = closable != null ? closable : true

	return (
		<div
			role="alert"
			className={clsx(props.className, styles.alert, styles[type])}
		>
			<span className={styles.icon}>
				<SvgInformationIcon />
			</span>
			<div className={styles.content}>
				{props.message && (
					<div className={styles.message}>{props.message}</div>
				)}
				{props.description && (
					<div className={styles.description}>{props.description}</div>
				)}
			</div>
			{isClosable && (
				<button
					className={styles.closeBtn}
					onClick={(e) => {
						if (props.onClose) {
							props.onClose()
						}
						analytics.track(`AlertClose-${trackingId}`)
						setTemporarilyHideAlert(true)
					}}
					aria-label="Close alert"
				>
					<SvgXIcon />
				</button>
			)}
		</div>
	)
}

export default Alert

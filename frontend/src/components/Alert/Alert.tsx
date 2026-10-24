import { Callout } from '@highlight-run/ui/components'
import analytics from '@util/analytics'
import clsx from 'clsx'
import { useSessionStorage } from 'react-use'

import styles from './Alert.module.css'

type AlertType = 'info' | 'success' | 'warning' | 'error'

export type AlertProps = {
	trackingId: string
	closable?: boolean
	shouldAlwaysShow?: boolean
	description?: React.ReactNode
	type?: AlertType
	onClose?: () => void
	message?: React.ReactNode
	className?: string
}

const typeToKind = (type: AlertType): 'info' | 'warning' | 'error' => {
	if (type === 'success') return 'info'
	return type
}

const Alert = ({
	trackingId,
	closable,
	shouldAlwaysShow = false,
	type = 'info',
	message,
	description,
	onClose,
	className,
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
		<Callout
			kind={typeToKind(type)}
			title={typeof message === 'string' ? message : undefined}
			className={clsx(styles.alert, className)}
			handleCloseClick={
				isClosable
					? () => {
							onClose?.()
							analytics.track(`AlertClose-${trackingId}`)
							setTemporarilyHideAlert(true)
						}
					: undefined
			}
		>
			{typeof message !== 'string' && message}
			{description}
		</Callout>
	)
}

export default Alert

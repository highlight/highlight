import SvgXIcon from '@icons/XIcon'
import analytics from '@util/analytics'
import { Callout } from '@highlight-run/ui/components'
import clsx from 'clsx'
import { useSessionStorage } from 'react-use'
import SvgInformationIcon from '../../static/InformationIcon'
import styles from './Alert.module.css'

export type AlertProps = {
	trackingId: string
	closable?: boolean
	shouldAlwaysShow?: boolean
} & {
	description?: React.ReactNode
	type?: 'info' | 'error' | 'warning' | 'success'
	onClose?: (e?: React.MouseEvent) => void
	message?: React.ReactNode
	className?: string
}

const Alert = ({
	trackingId,
	closable,
	shouldAlwaysShow = false,
	type = 'info',
	description,
	message,
	className,
	onClose,
}: AlertProps) => {
	const [temporarilyHideAlert, setTemporarilyHideAlert] = useSessionStorage(
		highlightHideAlert-,
		false,
	)

	if (temporarilyHideAlert && !shouldAlwaysShow) {
		return null
	}

	return (
		<Callout
			kind={type === 'success' ? 'info' : type}
			title={message}
			className={clsx(className, styles.alert)}
		>
			{description}
		</Callout>
	)
}

export default Alert
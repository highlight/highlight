import { Callout } from '@highlight-run/ui/components'
import analytics from '@util/analytics'
import clsx from 'clsx'
import React from 'react'
import { useSessionStorage } from 'react-use'

import styles from './Alert.module.css'

export type AlertProps = {
	trackingId: string
	closable?: boolean
	shouldAlwaysShow?: boolean
	description?: React.ReactNode
	type?: 'success' | 'info' | 'warning' | 'error'
	onClose?: (e: React.MouseEvent<HTMLDivElement>) => void
	message?: React.ReactNode
	className?: string
}

const mapTypeToKind = (
	type: string,
): 'info' | 'warning' | 'error' => {
	switch (type) {
		case 'error':
			return 'error'
		case 'warning':
			return 'warning'
		default:
			return 'info'
	}
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

	const handleClose = closable != null ? closable : true

	return (
		<Callout
			kind={mapTypeToKind(type)}
			title={props.message as string}
			handleCloseClick={
				handleClose
					? () => {
							if (props.onClose) {
								props.onClose({} as React.MouseEvent<HTMLDivElement>)
							}
							analytics.track(`AlertClose-${trackingId}`)
							setTemporarilyHideAlert(true)
						}
					: undefined
			}
			border="secondary"
		>
			{props.description && (
				<div className={clsx(props.className, styles.alert)}>
					{props.description}
				</div>
			)}
		</Callout>
	)
}

export default Alert

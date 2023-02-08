import {
	// eslint-disable-next-line no-restricted-imports
	Button as UIButton,
	ButtonProps as UIButtonProps,
	IconSolidLoading,
} from '@highlight-run/ui'
import analytics from '@util/analytics'
import * as rudderanalytics from 'rudder-sdk-js'

import * as style from './style.css'

export type ButtonProps = UIButtonProps & {
	/**
	 * Unique ID for tracking events. Try to follow convention of:
	 * camelCase(${context}${action})
	 */
	trackingId: string
	trackingProperties?: rudderanalytics.apiObject
	loading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
	children,
	trackingId,
	trackingProperties = {},
	onClick,
	iconLeft: iconLeftProp,
	loading,
	...props
}) => {
	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		if (loading) {
			return
		}

		analytics.track(trackingId, trackingProperties)

		if (onClick) {
			onClick(e)
		}
	}

	const iconLeft = loading ? (
		<IconSolidLoading className={style.loadingIcon} />
	) : (
		iconLeftProp
	)
	return (
		<UIButton {...props} iconLeft={iconLeft} onClick={handleClick}>
			{children}
		</UIButton>
	)
}

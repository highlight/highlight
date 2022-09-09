import {
	// Disabling here because we are using this file as a proxy.
	// eslint-disable-next-line no-restricted-imports
	Tooltip as AntDesignTooltip,
	TooltipProps as AntDesignTooltipProps,
} from 'antd'
import React from 'react'

import styles from './Tooltip.module.scss'

type TooltipProps = Pick<
	AntDesignTooltipProps,
	| 'title'
	| 'placement'
	| 'align'
	| 'arrowPointAtCenter'
	| 'overlayStyle'
	| 'mouseEnterDelay'
>

/**
 * A proxy for Ant Design's tooltip. This component should be used instead of directly using Ant Design's.
 */
const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
	children,
	mouseEnterDelay = 1,
	...props
}) => {
	return (
		<AntDesignTooltip
			{...props}
			mouseEnterDelay={mouseEnterDelay}
			overlayClassName={styles.tooltipOverlay}
			title={props.title}
			destroyTooltipOnHide
		>
			{children}
		</AntDesignTooltip>
	)
}

export default Tooltip

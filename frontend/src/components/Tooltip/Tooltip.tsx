import {
	Tooltip as AntDesignTooltip,
	TooltipProps as AntDesignTooltipProps,
} from 'antd'
import React from 'react'

import styles from './Tooltip.module.css'

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
 * Deprecated: use the UI package's tooltip instead of this tooltip
 * A proxy for Ant Design's tooltip. This component should be used instead of directly using Ant Design's.
 */
const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
	children,
	mouseEnterDelay = 0.5,
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

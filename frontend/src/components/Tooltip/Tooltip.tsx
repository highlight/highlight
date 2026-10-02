import { Tooltip as HighlightTooltip } from '@highlight-run/ui/components'
import React from 'react'

import styles from './Tooltip.module.css'

type TooltipProps = {
	title?: React.ReactNode
	placement?: string
	align?: object
	overlayStyle?: React.CSSProperties
	mouseEnterDelay?: number
}

/**
 * Deprecated: use the UI package's tooltip instead of this tooltip
 * A proxy for the Highlight UI tooltip. This component should be used instead of directly using antd's.
 */
const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
	children,
	mouseEnterDelay = 0.5,
	...props
}) => {
	return (
		<HighlightTooltip
			{...props}
			delayed={mouseEnterDelay > 0}
		>
			{children}
		</HighlightTooltip>
	)
}

export default Tooltip


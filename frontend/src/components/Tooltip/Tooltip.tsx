import { Tooltip as HighlightTooltip } from '@highlight-run/ui/components'
import React from 'react'

type TooltipProps = {
	title?: React.ReactNode
	placement?: string
	align?: unknown
	arrowPointAtCenter?: boolean
	overlayStyle?: React.CSSProperties
	mouseEnterDelay?: number
}

/**
 * A proxy that wraps @highlight-run/ui Tooltip with the legacy antd-style API.
 * Accepts `title` (tooltip content) and `children` (trigger element).
 */
const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
	children,
	title,
}) => {
	if (!title) {
		return <>{children}</>
	}

	return (
		<HighlightTooltip
			trigger={<span>{children}</span>}
			delayed
		>
			{title}
		</HighlightTooltip>
	)
}

export default Tooltip

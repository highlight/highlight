import {
	Tooltip as UiTooltip,
	TooltipContent,
} from '@highlight-run/ui/components'
import React from 'react'

type TooltipProps = {
	title?: React.ReactNode
	placement?: 'top' | 'bottom' | 'left' | 'right'
	mouseEnterDelay?: number
	arrowPointAtCenter?: boolean
	align?: { offset?: [number, number] }
	overlayStyle?: React.CSSProperties
}

/**
 * A proxy for the UI package's tooltip. This component should be used instead of directly using the UI package's.
 */
const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
	children,
	title,
	mouseEnterDelay = 0.5,
	placement,
	...props
}) => {
	if (title == undefined || title === '') {
		return <>{children}</>
	}

	return (
		<UiTooltip
			trigger={children as React.ReactNode}
			delayed={mouseEnterDelay > 0}
		>
			<TooltipContent>{title}</TooltipContent>
		</UiTooltip>
	)
}

export default Tooltip

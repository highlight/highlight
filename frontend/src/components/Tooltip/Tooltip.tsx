import {
	Tooltip as HLTooltip,
	TooltipProps as HLTooltipProps,
} from '@highlight-run/ui/components'
import React from 'react'

type AntdPlacement =
	| 'top'
	| 'left'
	| 'right'
	| 'bottom'
	| 'topLeft'
	| 'topRight'
	| 'bottomLeft'
	| 'bottomRight'
	| 'leftTop'
	| 'leftBottom'
	| 'rightTop'
	| 'rightBottom'

const placementMap: Partial<
	Record<AntdPlacement, HLTooltipProps['placement']>
> = {
	top: 'top',
	bottom: 'bottom',
	left: 'left',
	right: 'right',
	topLeft: 'top-start',
	topRight: 'top-end',
	bottomLeft: 'bottom-start',
	bottomRight: 'bottom-end',
	leftTop: 'left-start',
	leftBottom: 'left-end',
	rightTop: 'right-start',
	rightBottom: 'right-end',
}

type TooltipProps = {
	title?: React.ReactNode
	placement?: AntdPlacement
	mouseEnterDelay?: number
	overlayStyle?: React.CSSProperties
	align?: object
	arrowPointAtCenter?: boolean
}

/**
 * @deprecated Use Tooltip from @highlight-run/ui/components directly.
 * Kept as a compatibility wrapper for legacy call sites.
 */
const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
	children,
	title,
	placement,
	mouseEnterDelay = 0.5,
}) => {
	if (!title) {
		return <>{children}</>
	}

	return (
		<HLTooltip
			trigger={children}
			placement={
				placement ? (placementMap[placement] ?? 'top') : undefined
			}
			delayed={mouseEnterDelay > 0}
		>
			{title}
		</HLTooltip>
	)
}

export default Tooltip

import {
	Tooltip as AriakitTooltip,
	TooltipAnchor,
	TooltipState,
	useTooltipState,
} from 'ariakit'
import React from 'react'
import { Box } from '../Box/Box'

const STANDARD_DELAY = 500

export type TooltipProps = Partial<TooltipState> &
	React.PropsWithChildren<{
		trigger: React.ReactNode
		disabled?: boolean
		style?: React.CSSProperties
		delayed?: boolean
	}>

export const Tooltip: React.FC<TooltipProps> = ({
	children,
	trigger,
	disabled,
	style,
	delayed,
	...props
}: TooltipProps) => {
	const tooltipState = useTooltipState({
		placement: 'top',
		gutter: 4,
		timeout: delayed ? STANDARD_DELAY : 0,
		...props,
	})

	return (
		<>
			<TooltipAnchor
				state={tooltipState}
				style={{ display: 'flex', ...style }}
			>
				{trigger}
			</TooltipAnchor>
			{!disabled && (
				<AriakitTooltip state={tooltipState} style={{ zIndex: 100 }}>
					<TooltipContent>{children}</TooltipContent>
				</AriakitTooltip>
			)}
		</>
	)
}

export const TooltipContent: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	return (
		<Box
			backgroundColor="white"
			border="secondary"
			p="4"
			borderRadius="6"
			shadow="medium"
			style={{
				maxWidth: 350,
			}}
		>
			{children}
		</Box>
	)
}

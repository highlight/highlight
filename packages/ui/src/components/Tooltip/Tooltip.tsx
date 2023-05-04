import {
	Tooltip as AriakitTooltip,
	TooltipAnchor,
	TooltipState,
	useTooltipState,
} from 'ariakit'
import React from 'react'
import { Box } from '../Box/Box'

export type TooltipProps = Partial<TooltipState> &
	React.PropsWithChildren<{
		trigger: React.ReactNode
		disabled?: boolean
		style?: React.CSSProperties
	}>

export const Tooltip: React.FC<TooltipProps> = ({
	children,
	trigger,
	disabled,
	style,
	...props
}: TooltipProps) => {
	const tooltipState = useTooltipState({
		placement: 'top',
		gutter: 4,
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
					<TooltipRenderer>{children}</TooltipRenderer>
				</AriakitTooltip>
			)}
		</>
	)
}

const TooltipRenderer: React.FC<React.PropsWithChildren> = ({ children }) => {
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

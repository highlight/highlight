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
		trigger: React.ReactElement
	}>

export const Tooltip: React.FC<TooltipProps> = ({
	children,
	trigger,
	...props
}: TooltipProps) => {
	const tooltipState = useTooltipState({
		placement: 'top',
		gutter: 4,
		...props,
	})

	return (
		<Box display="inline-block">
			<TooltipAnchor state={tooltipState}>{trigger}</TooltipAnchor>
			<AriakitTooltip state={tooltipState}>
				<TooltipRenderer>{children}</TooltipRenderer>
			</AriakitTooltip>
		</Box>
	)
}

const TooltipRenderer: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<Box
			backgroundColor="white"
			border="primary"
			p="4"
			borderRadius="6"
			shadow="small"
			style={{
				maxWidth: 350,
			}}
		>
			{children}
		</Box>
	)
}

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
		disabled?: boolean
	}>

export const Tooltip: React.FC<TooltipProps> = ({
	children,
	trigger,
	disabled,
	...props
}: TooltipProps) => {
	const tooltipState = useTooltipState({
		placement: 'top',
		gutter: 4,
		...props,
	})

	return (
		<>
			<TooltipAnchor state={tooltipState} style={{ display: 'flex' }}>
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
			shadow="small"
			style={{
				maxWidth: 350,
			}}
		>
			{children}
		</Box>
	)
}

import {
	Tooltip as AriakitTooltip,
	TooltipAnchor,
	TooltipStoreProps,
	useTooltipStore,
} from '@ariakit/react'
import React from 'react'
import { Box } from '../Box/Box'

const STANDARD_DELAY = 500

export type TooltipProps = Partial<TooltipStoreProps> &
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
	const tooltipState = useTooltipStore({
		placement: 'top',
		timeout: delayed ? STANDARD_DELAY : 0,
		...props,
	})

	return (
		<>
			<TooltipAnchor
				store={tooltipState}
				style={{ display: 'flex', ...style }}
			>
				{trigger}
			</TooltipAnchor>
			{!disabled && (
				<AriakitTooltip
					store={tooltipState}
					gutter={4}
					style={{ zIndex: 100 }}
				>
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

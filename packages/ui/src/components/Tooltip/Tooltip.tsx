import * as Ariakit from '@ariakit/react'
import React from 'react'
import { Box } from '../Box/Box'

const STANDARD_DELAY = 500

export type TooltipProps = Partial<Ariakit.TooltipStoreProps> &
	React.PropsWithChildren<{
		trigger: React.ReactNode
		disabled?: boolean
		style?: React.CSSProperties
		delayed?: boolean
		tooltipRef?: React.RefObject<HTMLElement>
		renderInLine?: boolean // used when trying to display a tooltip in a modal
	}>

export const Tooltip: React.FC<TooltipProps> = ({
	children,
	trigger,
	disabled,
	style,
	delayed,
	renderInLine,
	...props
}: TooltipProps) => {
	const tooltipStore = Ariakit.useTooltipStore({
		placement: 'top',
		timeout: delayed ? STANDARD_DELAY : 0,
		...props,
	})

	return (
		<>
			<Ariakit.TooltipAnchor
				store={tooltipStore}
				style={{ display: 'flex', ...style }}
			>
				{trigger}
			</Ariakit.TooltipAnchor>
			{!disabled && (
				<Ariakit.Tooltip
					store={tooltipStore}
					gutter={4}
					style={{ zIndex: 100 }}
					portal={!renderInLine}
				>
					{/*
					There is a bug in v0.2.17 of Ariakit where you need to have this arrow
					rendered or else positioning of the popover breaks. We render it, but
					hide it by setting size={0}. This is an issue with anything using a
					popover coming from the floating-ui library.
					*/}
					<Ariakit.TooltipArrow size={0} />
					<TooltipContent>{children}</TooltipContent>
				</Ariakit.Tooltip>
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

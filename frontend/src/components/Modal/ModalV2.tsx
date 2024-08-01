import {
	Box,
	ButtonIcon,
	IconSolidX,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import type { sprinkles } from '@highlight-run/ui/sprinkles'
import { vars } from '@highlight-run/ui/vars'
import clsx from 'clsx'
import React from 'react'
import { createPortal } from 'react-dom'

import { styledVerticalScrollbar } from '@/style/common.css'

import * as style from './ModalV2.css'

export const Modal: React.FC<
	React.PropsWithChildren<{
		onClose?: () => void
		justifyContent?: Pick<
			Parameters<typeof sprinkles>[0],
			'justifyContent'
		>['justifyContent']
		width?: Pick<Parameters<typeof sprinkles>[0], 'width'>['width']
		height?: Pick<Parameters<typeof sprinkles>[0], 'height'>['height']
		innerWidth?: Pick<Parameters<typeof sprinkles>[0], 'width'>['width']
		innerHeight?: Pick<Parameters<typeof sprinkles>[0], 'height'>['height']
		maxHeight?: string
		title?: React.ReactNode
		footer?: React.ReactNode
	}>
> = ({
	children,
	width,
	height,
	innerWidth,
	innerHeight,
	maxHeight,
	justifyContent,
	onClose,
	title,
	footer,
}) => {
	const portalRoot = document.getElementById('portal')!
	return createPortal(
		<Box
			width="screen"
			display="flex"
			height="screen"
			position="fixed"
			alignItems="flex-start"
			justifyContent="center"
			style={{
				top: 0,
				left: 0,
				zIndex: '20001', // +1 more than the header z-index
				overflow: 'hidden',
				backgroundColor: '#6F6E777A',
			}}
			onClick={onClose}
		>
			<Stack
				justifyContent={justifyContent}
				width={width}
				height={height}
				gap="12"
				cssClass={clsx(styledVerticalScrollbar, style.modalInner)}
				style={{
					maxHeight,
				}}
			>
				<Box
					width={innerWidth}
					height={innerHeight}
					display="flex"
					flexDirection="column"
					borderRadius="8"
					border="secondary"
					shadow="medium"
					backgroundColor="white"
					onClick={(e) => e.stopPropagation()}
				>
					{title ? (
						<Box
							display="flex"
							alignItems="center"
							userSelect="none"
							px="8"
							py="4"
							bb="secondary"
							justifyContent="space-between"
						>
							<Text
								size="xxSmall"
								color="secondaryContentText"
								weight="medium"
							>
								{title}
							</Text>
							<ButtonIcon
								kind="secondary"
								emphasis="none"
								size="minimal"
								onClick={onClose}
								icon={
									<IconSolidX
										size={14}
										color={
											vars.theme.interactive.fill
												.secondary.content.text
										}
									/>
								}
							/>
						</Box>
					) : null}
					{children}
				</Box>
				{footer}
			</Stack>
		</Box>,
		portalRoot,
		'modal',
	)
}

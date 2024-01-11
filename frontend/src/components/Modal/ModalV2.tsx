import {
	Box,
	ButtonIcon,
	IconSolidX,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import clsx from 'clsx'
import React from 'react'

import { styledVerticalScrollbar } from '@/style/common.css'

import * as style from './ModalV2.css'

export const Modal: React.FC<
	React.PropsWithChildren<{
		onClose?: () => void
		maxHeight?: string
		title?: string
		footer?: React.ReactNode
	}>
> = ({ children, maxHeight, onClose, title, footer }) => {
	return (
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
				zIndex: '90',
				overflow: 'hidden',
				backgroundColor: '#6F6E777A',
			}}
			onClick={onClose}
		>
			<Stack
				gap="12"
				cssClass={clsx(styledVerticalScrollbar, style.modalInner)}
				style={{
					maxHeight,
				}}
			>
				<Box
					display="flex"
					flexDirection="column"
					borderRadius="8"
					border="secondary"
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
								size="xSmall"
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
		</Box>
	)
}

import { makeVar, useReactiveVar } from '@apollo/client'
import {
	Box,
	ButtonIcon,
	IconSolidCheckCircle,
	IconSolidExclamation,
	IconSolidInformationCircle,
	IconSolidX,
	IconSolidXCircle,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import React from 'react'

import * as styles from './styles.css'

enum ToastType {
	error,
	info,
	success,
	warning,
}

type Toast = {
	id: string
	message: string
	type: ToastType
	duration: number
	content?: React.ReactNode
}

type Options = {
	id?: string
	duration?: number
	content?: React.ReactNode
}

const DEFAULT_DURATION = 1500

const toastVar = makeVar<Toast[]>([])

const makeToast = (message: string, type: Toast['type'], options?: Options) => {
	const duration = options?.duration || DEFAULT_DURATION
	const id = options?.id || Math.random().toString(36).substring(2, 9)
	return { id, message, type, duration, content: options?.content }
}

const addToast = (toast: Toast) => {
	const toasts = toastVar()
	toastVar([...toasts, toast])

	return new Promise<void>((resolve) => {
		setTimeout(() => {
			destroy(toast.id)
			resolve()
		}, toast.duration)
	})
}

const destroy = (id: string) => {
	const toasts = toastVar()
	toastVar(toasts.filter((t) => t.id !== id))
}

const error = (message: string, options?: Options) => {
	const toast = makeToast(message, ToastType.error, options)
	return addToast(toast)
}

const info = (message: string, options?: Options) => {
	const toast = makeToast(message, ToastType.info, options)
	return addToast(toast)
}

const success = (message: string, options?: Options) => {
	const toast = makeToast(message, ToastType.success, options)
	return addToast(toast)
}

const warning = (message: string, options?: Options) => {
	const toast = makeToast(message, ToastType.warning, options)
	return addToast(toast)
}

export const toast = {
	destroy,
	error,
	info,
	success,
	warning,
}

export const Toaster: React.FC = () => {
	const toasts = useReactiveVar(toastVar)
	return (
		<Stack cssClass={styles.toastContainer} pr="32" pb="32" gap="16">
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} />
			))}
		</Stack>
	)
}

const ICON_TYPE_MAPPINGS = {
	[ToastType.error]: {
		icon: <IconSolidXCircle size={14} color="#CD2B31" />,
	},
	[ToastType.info]: {
		icon: <IconSolidInformationCircle size={14} color="#6F6E77" />,
	},
	[ToastType.success]: {
		icon: <IconSolidCheckCircle size={14} color="#18794E" />,
	},
	[ToastType.warning]: {
		icon: <IconSolidExclamation size={14} color="#AD5700" />,
	},
}

type ToastItemProps = {
	toast: Toast
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
	const typeInfo = ICON_TYPE_MAPPINGS[toast.type]

	const handleClose = (e: React.MouseEvent) => {
		e.stopPropagation()
		destroy(toast.id)
	}

	return (
		<Box
			backgroundColor="white"
			gap="6"
			p="8"
			borderRadius="6"
			border="divider"
			display="flex"
			boxShadow="medium"
			cssClass={styles.toastItem}
		>
			<Box display="flex" alignItems="flex-start" pt="2">
				{typeInfo.icon}
			</Box>
			<Stack direction="row" justifyContent="space-between" width="full">
				<Stack direction="column" gap="8">
					<Box display="flex" alignItems="flex-start" py="4">
						<Text weight="medium">{toast.message}</Text>
					</Box>

					{!!toast.content && (
						<Box display="flex">{toast.content}</Box>
					)}
				</Stack>
				<Box display="flex" alignItems="flex-start">
					<ButtonIcon
						icon={<IconSolidX size={14} />}
						kind="secondary"
						size="minimal"
						emphasis="low"
						onClick={handleClose}
					/>
				</Box>
			</Stack>
		</Box>
	)
}

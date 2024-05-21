import { makeVar, useReactiveVar } from '@apollo/client'
import {
	Box,
	IconSolidCheckCircle,
	IconSolidExclamationCircle,
	IconSolidInformationCircle,
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
}

const DEFAULT_DURATION = 1500

const toastVar = makeVar<Toast[]>([])

const makeToast = (message: string, type: Toast['type'], options?: Options) => {
	const duration = options?.duration || DEFAULT_DURATION
	const id = options?.id || Math.random().toString(36).substring(2, 9)
	return { id, message, type, duration }
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
		<Stack cssClass={styles.toast} pr="32" pb="32" gap="16">
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} />
			))}
		</Stack>
	)
}

const ICON_TYPE_MAPPINGS = {
	[ToastType.error]: {
		icon: <IconSolidXCircle color="#CD2B31" />,
		color: '#CD2B31',
		backgroundColor: '#FFEFEF',
		borderColor: '#F9C6C6',
	},
	[ToastType.info]: {
		icon: <IconSolidInformationCircle color="#6F6E77" />,
		color: '#1A1523',
		backgroundColor: '#F4F2F4',
		borderColor: '#6F6E77',
	},
	[ToastType.success]: {
		icon: <IconSolidCheckCircle color="#18794E" />,
		color: '#18794E',
		backgroundColor: '#E9F6E9',
		borderColor: '#B2DDB5',
	},
	[ToastType.warning]: {
		icon: <IconSolidExclamationCircle color="#AD5700" />,
		color: '#AD5700',
		backgroundColor: '#FFFAB8',
		borderColor: '#F3D768',
	},
}

type ToastItemProps = {
	toast: Toast
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
	const typeInfo = ICON_TYPE_MAPPINGS[toast.type]

	// TODO(spenny): add X button
	// TODO(spenny): add custom content
	return (
		<Stack
			p="8"
			direction="row"
			gap="6"
			borderRadius="6"
			style={{
				backgroundColor: typeInfo.backgroundColor,
				border: `1px solid ${typeInfo.borderColor}`,
				color: typeInfo.color,
			}}
		>
			<Box display="flex" alignItems="center">
				{typeInfo.icon}
			</Box>
			<Box display="flex" alignItems="center">
				<Text weight="medium">{toast.message}</Text>
			</Box>
		</Stack>
	)
}

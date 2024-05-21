import { makeVar, useReactiveVar } from '@apollo/client'
import React from 'react'

import * as styles from './styles.css'

type Toast = {
	id: string
	message: React.ReactNode
	type: 'success' | 'error' | 'info' | 'warning'
	duration: number
}

type Options = {
	id?: string
	duration?: number
}

const DEFAULT_DURATION = 1500

const toastVar = makeVar<Toast[]>([])

const makeToast = (
	message: React.ReactNode,
	type: Toast['type'],
	options?: Options,
) => {
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

const info = (message: React.ReactNode, options?: Options) => {
	const toast = makeToast(message, 'info', options)
	return addToast(toast)
}

const error = (message: React.ReactNode, options?: Options) => {
	const toast = makeToast(message, 'error', options)
	return addToast(toast)
}

const warning = (message: React.ReactNode, options?: Options) => {
	const toast = makeToast(message, 'warning', options)
	return addToast(toast)
}

const success = (message: React.ReactNode, options?: Options) => {
	const toast = makeToast(message, 'success', options)
	return addToast(toast)
}

const destroy = (id: string) => {
	const toasts = toastVar()
	toastVar(toasts.filter((t) => t.id !== id))
}

export const toast = {
	info,
	error,
	warning,
	success,
	destroy,
}

export const Toaster: React.FC = () => {
	const toasts = useReactiveVar(toastVar)
	return (
		<div className={styles.toast}>
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} />
			))}
		</div>
	)
}

type ToastItemProps = {
	toast: Toast
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
	return <div>{toast.message}</div>
}

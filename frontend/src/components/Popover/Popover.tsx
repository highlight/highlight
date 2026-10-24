import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'

import styles from './Popover.module.css'

export type PopoverProps = {
	content?: React.ReactNode | (() => React.ReactNode)
	title?: React.ReactNode | (() => React.ReactNode)
	trigger?: 'click' | 'hover' | 'focus'
	defaultVisible?: boolean
	onVisibleChange?: (visible: boolean) => void
	placement?: string
	visible?: boolean
	overlayClassName?: string
	isList?: boolean
	popoverClassName?: string
	large?: boolean
	contentContainerClassName?: string
	onMouseEnter?: React.MouseEventHandler<HTMLDivElement>
	onMouseLeave?: React.MouseEventHandler<HTMLDivElement>
	getPopupContainer?: () => HTMLElement
	children?: React.ReactNode
}

/**
 * A proxy popover component. Replaces the antd Popover dependency.
 */
const Popover: React.FC<React.PropsWithChildren<PopoverProps>> = ({
	children,
	title,
	isList,
	popoverClassName,
	contentContainerClassName,
	large = false,
	onMouseEnter,
	onMouseLeave,
	trigger = 'click',
	defaultVisible = false,
	onVisibleChange,
	visible: controlledVisible,
	overlayClassName,
	...props
}) => {
	const [open, setOpen] = useState(defaultVisible)
	const ref = useRef<HTMLDivElement>(null)

	const isOpen = controlledVisible !== undefined ? controlledVisible : open

	const toggle = (next: boolean) => {
		setOpen(next)
		onVisibleChange?.(next)
	}

	// Close on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				toggle(false)
			}
		}
		if (isOpen) document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [isOpen])

	const triggerProps =
		trigger === 'hover'
			? {
					onMouseEnter: () => toggle(true),
					onMouseLeave: () => toggle(false),
				}
			: {
					onClick: () => toggle(!isOpen),
				}

	return (
		<div
			ref={ref}
			style={{ display: 'inline-block', position: 'relative' }}
		>
			<div {...triggerProps}>{children}</div>
			{isOpen && (
				<div
					className={clsx(
						styles.popover,
						popoverClassName,
						overlayClassName,
					)}
				>
					<div
						className={clsx(
							{
								[styles.contentContainer]: !isList,
								[styles.large]: large,
							},
							contentContainerClassName,
						)}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
					>
						{title && (
							<div>
								{typeof title === 'function' ? title() : title}
							</div>
						)}
						<div className={styles.content}>
							{typeof props.content === 'function'
								? props.content()
								: props.content}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default Popover

import { useHTMLElementEvent } from '@hooks/useHTMLElementEvent'
import { useWindowEvent } from '@hooks/useWindowEvent'
import { clamp } from '@util/numbers'
import React, { useCallback } from 'react'

export const DEV_TOOLS_MIN_HEIGHT = 200

export function ResizePanel({
	children,
	defaultHeight,
	minHeight,
	maxHeight,
	heightPersistenceKey,
}: {
	children: (props: {
		panelRef: (element: HTMLElement | null) => void
		handleRef: (element: HTMLElement | null) => void
	}) => React.ReactNode
	defaultHeight?: number
	minHeight?: number
	maxHeight: number
	heightPersistenceKey?: string
}) {
	const [panel, setPanel] = React.useState<HTMLElement | null>()
	const [handle, handleRef] = React.useState<HTMLElement | null>()
	const [dragging, setDragging] = React.useState(false)

	const panelRef = useCallback(
		(element: HTMLElement | null) => {
			if (!element) return
			setPanel(element)

			let initialHeight = Math.max(defaultHeight || 0, minHeight || 0)
			if (heightPersistenceKey) {
				const storedHeight = Number(
					localStorage.getItem(heightPersistenceKey),
				)
				if (Number.isFinite(storedHeight)) {
					initialHeight = storedHeight
				}
			}

			if (initialHeight) {
				element.style.height = `${initialHeight}px`
			}
		},
		[defaultHeight, minHeight, heightPersistenceKey],
	)

	useHTMLElementEvent(handle, 'pointerdown', (event) => {
		if (handle && event.composedPath().includes(handle)) {
			setDragging(true)
			event.preventDefault()
		}
	})

	useWindowEvent('pointermove', (event) => {
		if (dragging && panel) {
			const panelRect = panel.getBoundingClientRect()
			const newHeight = clamp(
				panelRect.height - event.movementY,
				minHeight || 0,
				maxHeight,
			)

			panel.style.height = `${newHeight}px`
			if (heightPersistenceKey) {
				localStorage.setItem(heightPersistenceKey, String(newHeight))
			}

			event.preventDefault()
			event.stopPropagation()
		}
	})

	useWindowEvent('pointerup', (event) => {
		setDragging(false)
		event.preventDefault()
		event.stopPropagation()
	})

	return <>{children({ panelRef, handleRef })}</>
}

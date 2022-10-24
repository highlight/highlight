import {
	useToolbarItemsContext,
	ZoomAreaPercent,
} from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext'
import { clamp } from '@util/numbers'
import { RefObject, useLayoutEffect, useRef, useState } from 'react'

import style from './ZoomArea.module.scss'

interface Props {
	containerWidth: number
	wrapperRef: RefObject<HTMLElement>
	update: (p: ZoomAreaPercent) => void
	minZoomAreaPercent: number
}
const ZOOM_AREA_SIDE = 15

const ZoomArea = ({ wrapperRef, update, minZoomAreaPercent }: Props) => {
	const leftRef = useRef<HTMLDivElement>(null)
	const rightRef = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	const [isDragging, setIsDragging] = useState<boolean>(false)
	const { zoomAreaPercent } = useToolbarItemsContext()
	const [dragPercent, setDragPercent] =
		useState<ZoomAreaPercent>(zoomAreaPercent)

	const leftDiv = leftRef.current
	const rightDiv = rightRef.current
	const wrapperDiv = wrapperRef.current
	const containerDiv = containerRef.current

	const wrapperBbox = wrapperRef.current?.getBoundingClientRect()
	const wrapperWidth = wrapperBbox?.width || 1
	const wrapperLeft = wrapperBbox?.left || 0

	useLayoutEffect(() => {
		if (!leftDiv || !rightDiv || !wrapperDiv || !containerDiv) {
			return
		}

		const getRelativeX = (event: MouseEvent) => {
			const { clientX } = event
			return clientX + document.documentElement.scrollLeft - wrapperLeft
		}

		let isLeftDragging = false
		const onDrag = (event: MouseEvent) => {
			event.preventDefault()
			setIsDragging(true)
		}

		const onLeftPointerDown = (event: MouseEvent) => {
			onDrag(event)
			isLeftDragging = true
		}

		let isRightDragging = false
		const onRightPointerDown = (event: MouseEvent) => {
			onDrag(event)
			isRightDragging = true
		}

		let isPanning = false
		let panX = 0
		const onCenterPointerDown = (event: MouseEvent) => {
			onDrag(event)
			isPanning = !isLeftDragging && !isRightDragging
			if (isPanning) {
				panX = getRelativeX(event)
			}
			containerDiv.style.cursor = 'grabbing'
		}

		const onPointerMove = (event: MouseEvent) => {
			event.preventDefault()
			const percent = (100 * getRelativeX(event)) / wrapperWidth
			if (isLeftDragging) {
				setDragPercent(({ right }) => {
					const zoomPercent = {
						left: clamp(percent, 0, right - minZoomAreaPercent),
						right,
					}
					update(zoomPercent)
					return zoomPercent
				})
			} else if (isRightDragging) {
				setDragPercent(({ left }) => {
					const zoomPercent = {
						left,
						right: clamp(percent, left + minZoomAreaPercent, 100),
					}
					update(zoomPercent)
					return zoomPercent
				})
			} else if (isPanning) {
				const offsetX = getRelativeX(event) - panX
				const offset = (100 * offsetX) / wrapperWidth

				setDragPercent(({ left, right }) => {
					const width = right - left
					const newLeft = clamp(left + offset, 0, 100 - width)
					const newRight = clamp(newLeft + width, 0, 100)
					const zoomPercent = {
						left: newLeft,
						right: newRight,
					}
					update(zoomPercent)
					return zoomPercent
				})
				panX += offsetX
			}
		}

		const onPointerUp = () => {
			if (isLeftDragging || isRightDragging || isPanning) {
				isLeftDragging = false
				isRightDragging = false
				isPanning = false
				setIsDragging(false)
				containerDiv.style.cursor = 'grab'
			}
		}

		leftDiv.addEventListener('pointerdown', onLeftPointerDown)
		rightDiv.addEventListener('pointerdown', onRightPointerDown)
		containerDiv.addEventListener('pointerdown', onCenterPointerDown)
		document.addEventListener('pointermove', onPointerMove)
		document.addEventListener('pointerup', onPointerUp)
		return () => {
			leftDiv.removeEventListener('pointerdown', onLeftPointerDown)
			rightDiv.removeEventListener('pointerdown', onRightPointerDown)
			containerDiv.removeEventListener('pointerdown', onCenterPointerDown)
			document.removeEventListener('pointermove', onPointerMove)
			document.removeEventListener('pointerup', onPointerUp)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [containerDiv, leftDiv, rightDiv, wrapperDiv, wrapperWidth, wrapperLeft])

	useLayoutEffect(() => {
		if (!isDragging) {
			setDragPercent(zoomAreaPercent)
		}
	}, [isDragging, zoomAreaPercent])

	const { left, right } = dragPercent
	const percentWidth = clamp(right - left, minZoomAreaPercent, 100)
	const isWide = (percentWidth * wrapperWidth) / 100 > 2 * ZOOM_AREA_SIDE + 1
	const sideWidth = isWide ? ZOOM_AREA_SIDE : 0
	const handleWidth = isWide ? 3 : 0

	const isHidden = !isDragging && percentWidth === 100
	return (
		<div
			style={{
				left: `${left}%`,
				width: `${percentWidth}%`,
				visibility: isHidden ? 'hidden' : 'visible',
			}}
			className={style.zoomArea}
			ref={containerRef}
		>
			<div
				ref={leftRef}
				className={style.zoomAreaSide}
				style={{ alignItems: 'flex-start', width: sideWidth }}
			>
				<span
					className={style.zoomAreaHandle}
					style={{ width: handleWidth }}
				/>
			</div>

			<div
				ref={rightRef}
				className={style.zoomAreaSide}
				style={{ alignItems: 'flex-end', width: sideWidth }}
			>
				<span
					className={style.zoomAreaHandle}
					style={{ width: handleWidth }}
				/>
			</div>
		</div>
	)
}

export default ZoomArea

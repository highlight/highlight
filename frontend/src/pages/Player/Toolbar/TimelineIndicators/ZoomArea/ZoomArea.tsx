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
}
const ZOOM_AREA_SIDE = 15

const ZoomArea = ({ wrapperRef, update }: Props) => {
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

	const wrapperWidth = wrapperDiv?.offsetWidth || 1
	const minAreaPercent = (100 * (2 * ZOOM_AREA_SIDE)) / wrapperWidth

	useLayoutEffect(() => {
		if (!leftDiv || !rightDiv || !wrapperDiv || !containerDiv) {
			return
		}

		const getRelativeX = (event: MouseEvent) => {
			const { clientX } = event
			return (
				clientX +
				document.documentElement.scrollLeft -
				wrapperDiv.offsetLeft
			)
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
			event.stopPropagation()
			const percent = (100 * getRelativeX(event)) / wrapperWidth
			if (isLeftDragging) {
				setDragPercent(({ right }) => {
					const zoomPercent = {
						left: clamp(percent, 0, right - minAreaPercent),
						right,
					}
					update(zoomPercent)
					return zoomPercent
				})
			} else if (isRightDragging) {
				setDragPercent(({ left }) => {
					const zoomPercent = {
						left,
						right: clamp(percent, left + minAreaPercent, 100),
					}
					update(zoomPercent)
					return zoomPercent
				})
			} else if (isPanning) {
				const offsetX = getRelativeX(event) - panX
				const offset = (100 * offsetX) / wrapperWidth

				setDragPercent(({ left, right }) => {
					const zoomerWidth = right - left
					const newLeft = clamp(left + offset, 0, 100 - zoomerWidth)
					const zoomPercent = {
						left: newLeft,
						right: clamp(
							newLeft + zoomerWidth,
							minAreaPercent,
							100,
						),
					}
					update(zoomPercent)
					return zoomPercent
				})
				panX += offsetX
			}
		}

		const onPointerUp = () => {
			if (isLeftDragging || isRightDragging || isPanning) {
				update({
					left: clamp(
						(100 * containerDiv.offsetLeft) / wrapperWidth,
						0,
						100,
					),
					right: clamp(
						(100 *
							(containerDiv.offsetLeft +
								containerDiv.offsetWidth)) /
							wrapperWidth,
						0,
						100,
					),
				})
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
	}, [
		containerDiv,
		leftDiv,
		minAreaPercent,
		rightDiv,
		wrapperDiv,
		wrapperWidth,
	])

	useLayoutEffect(() => {
		if (!isDragging) {
			setDragPercent(zoomAreaPercent)
		}
	}, [isDragging, zoomAreaPercent])

	const left = dragPercent.left
	const percentWidth = clamp(
		dragPercent.right - left,
		100 / wrapperWidth,
		100,
	)
	const isWide = (percentWidth * wrapperWidth) / 100 > 2 * ZOOM_AREA_SIDE + 1
	const sideWidth = isWide ? ZOOM_AREA_SIDE : 0
	const handleWidth = isWide ? 3 : 0

	const isHidden = !isDragging && left === 0 && percentWidth === 100

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

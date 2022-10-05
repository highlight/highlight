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
				setDragPercent(({ right }) => ({
					left: clamp(percent, 0, right - minAreaPercent),
					right,
				}))
			} else if (isRightDragging) {
				setDragPercent(({ left }) => ({
					left,
					right: clamp(percent, left + minAreaPercent, 100),
				}))
			} else if (isPanning) {
				const offsetX = getRelativeX(event) - panX
				const offset = (100 * offsetX) / wrapperWidth

				setDragPercent(({ left, right }) => {
					const width = right - left
					const newLeft = clamp(left + offset, 0, 100 - width)
					return {
						left: newLeft,
						right: clamp(newLeft + width, minAreaPercent, 100),
					}
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
	}, [
		containerDiv,
		wrapperWidth,
		leftDiv,
		minAreaPercent,
		rightDiv,
		update,
		wrapperDiv,
	])

	const left = dragPercent.left
	const width = clamp(dragPercent.right - left, 100 / wrapperWidth, 100)

	useLayoutEffect(() => {
		if (!isDragging) {
			setDragPercent(zoomAreaPercent)
		}
	}, [isDragging, zoomAreaPercent])

	const isHidden = !isDragging && left === 0 && width === 100

	return (
		<div
			style={{
				left: `${left}%`,
				width: `${width}%`,
				visibility: isHidden ? 'hidden' : 'visible',
			}}
			className={style.zoomArea}
			ref={containerRef}
		>
			<div
				ref={leftRef}
				className={style.zoomAreaSide}
				style={{ alignItems: 'flex-start', width: ZOOM_AREA_SIDE }}
			>
				<span className={style.zoomAreaHandle} />
			</div>

			<div
				ref={rightRef}
				className={style.zoomAreaSide}
				style={{ alignItems: 'flex-end', width: ZOOM_AREA_SIDE }}
			>
				<span className={style.zoomAreaHandle} />
			</div>
		</div>
	)
}

export default ZoomArea

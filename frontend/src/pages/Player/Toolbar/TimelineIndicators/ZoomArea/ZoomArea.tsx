import { useHTMLElementEvent } from '@hooks/useHTMLElementEvent'
import { useWindowEvent } from '@hooks/useWindowEvent'
import {
	useToolbarItemsContext,
	ZoomAreaPercent,
} from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext'
import { clamp } from '@util/numbers'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

import * as style from './ZoomArea.css'

interface Props {
	containerWidth: number
	containerLeft: number
	update: (p: ZoomAreaPercent) => void
	minZoomAreaPercent: number
}
const ZOOM_AREA_SIDE = 8

const ZoomArea = ({
	update,
	minZoomAreaPercent,
	containerWidth,
	containerLeft,
}: Props) => {
	const leftRef = useRef<HTMLDivElement>(null)
	const rightRef = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	const [isLeftDragging, setIsLeftDragging] = useState<boolean>(false)
	const [isRightDragging, setIsRightDragging] = useState<boolean>(false)
	const [isPanning, setIsPanning] = useState<boolean>(false)
	const { zoomAreaPercent } = useToolbarItemsContext()
	const [dragPercent, setDragPercent] =
		useState<ZoomAreaPercent>(zoomAreaPercent)

	const getRelativeX = (event: MouseEvent) => {
		const { clientX } = event
		return clientX + document.documentElement.scrollLeft - containerLeft
	}

	const onLeftPointerDown = () => {
		setIsLeftDragging(true)
	}

	useHTMLElementEvent(leftRef.current, 'pointerdown', onLeftPointerDown, {
		passive: true,
	})

	const onRightPointerDown = () => {
		setIsRightDragging(true)
	}

	useHTMLElementEvent(rightRef.current, 'pointerdown', onRightPointerDown, {
		passive: true,
	})

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setPanX] = useState<number>(0)

	const onCenterPointerDown = (event: MouseEvent) => {
		const containerDiv = containerRef.current

		if (!containerDiv) {
			return
		}

		if (!isLeftDragging && !isRightDragging) {
			setIsPanning(true)
			setPanX(getRelativeX(event))
		}
	}

	useHTMLElementEvent(
		containerRef.current,
		'pointerdown',
		onCenterPointerDown,
		{
			passive: true,
		},
	)

	const onPointerUp = () => {
		if (isLeftDragging || isRightDragging || isPanning) {
			setIsLeftDragging(false)
			setIsRightDragging(false)
			setIsPanning(false)
			update(dragPercent)
		}

		const containerDiv = containerRef.current

		if (!containerDiv) {
			return
		}
	}

	useWindowEvent('pointerup', onPointerUp, { passive: true })

	const onPointerMove = (event: MouseEvent) => {
		const percent = (100 * getRelativeX(event)) / containerWidth
		if (isLeftDragging) {
			setDragPercent(({ right }) => {
				const zoomPercent = {
					left: clamp(percent, 0, right - minZoomAreaPercent),
					right,
				}
				requestAnimationFrame(() => update(zoomPercent))
				return zoomPercent
			})
		} else if (isRightDragging) {
			setDragPercent(({ left }) => {
				const zoomPercent = {
					left,
					right: clamp(percent, left + minZoomAreaPercent, 100),
				}
				requestAnimationFrame(() => update(zoomPercent))
				return zoomPercent
			})
		} else if (isPanning) {
			setPanX((panX) => {
				const offsetX = getRelativeX(event) - panX
				const offset = (100 * offsetX) / containerWidth

				setDragPercent(({ left, right }) => {
					const width = right - left
					const newLeft = clamp(left + offset, 0, 100 - width)
					const newRight = clamp(newLeft + width, 0, 100)
					const zoomPercent = {
						left: newLeft,
						right: newRight,
					}
					requestAnimationFrame(() => update(zoomPercent))
					return zoomPercent
				})
				return panX + offsetX
			})
		}
	}

	useWindowEvent('pointermove', onPointerMove, { passive: true })

	const doesNoAction = !isLeftDragging && !isRightDragging && !isPanning
	useEffect(() => {
		if (doesNoAction) {
			setDragPercent(zoomAreaPercent)
		}
	}, [doesNoAction, zoomAreaPercent])

	const { left, right } = dragPercent
	const percentWidth = clamp(right - left, minZoomAreaPercent, 100)
	const isWide =
		(percentWidth * containerWidth) / 100 > 2 * ZOOM_AREA_SIDE + 1
	const sideWidth = isWide ? ZOOM_AREA_SIDE : 0
	const handleWidth = isWide ? 3 : 0
	const canDrag = percentWidth < 100

	return (
		<div
			style={{
				left: `${left}%`,
				width: `${percentWidth}%`,
			}}
			className={clsx(style.zoomArea, {
				[style.zoomAreaDraggable]: canDrag,
				[style.animated]: !doesNoAction,
			})}
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
			<div ref={containerRef} className={style.zoomAreaPanSpace} />
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

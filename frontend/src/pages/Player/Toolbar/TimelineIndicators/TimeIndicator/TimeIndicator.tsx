import { RefObject, useLayoutEffect, useRef, useState } from 'react'

import style from './TimeIndicator.module.scss'
interface Props {
	left: number
	topRef: RefObject<HTMLElement>
	hairRef: RefObject<HTMLElement>
	viewportRef: RefObject<HTMLElement>
	text?: string
	isDragging?: boolean
}
const TIME_INDICATOR_ACTIVATION_RADIUS = 15
const TimeIndicator = ({
	left,
	topRef,
	hairRef,
	text,
	isDragging,
	viewportRef,
}: Props) => {
	const indicatorRef = useRef<HTMLDivElement>(null)
	const textRef = useRef<HTMLElement>(null)
	const [isTextVisible, setIsTextVisible] = useState(false)

	useLayoutEffect(() => {
		const topElem = topRef.current
		const hairElem = hairRef.current
		const container = indicatorRef.current
		const viewport = viewportRef.current
		if (!topElem || !hairElem || !container || !viewport) {
			return
		}

		const isClose = (event: MouseEvent) => {
			const { clientX, clientY } = event
			if (
				clientX < viewport.offsetLeft ||
				clientX > viewport.offsetLeft + viewport.offsetWidth
			) {
				return false
			}
			const bbox = topElem.getBoundingClientRect()
			const topCenterX = bbox.left + bbox.width / 2
			const topCenterY = bbox.top + bbox.height / 2
			const pointerX = document.documentElement.scrollLeft + clientX
			const pointerY = document.documentElement.scrollTop + clientY

			return (
				isDragging ||
				(pointerX - topCenterX) ** 2 + (pointerY - topCenterY) ** 2 <
					TIME_INDICATOR_ACTIVATION_RADIUS ** 2
			)
		}

		const checkVisibility = (event: MouseEvent) => {
			setIsTextVisible(isClose(event))
		}

		const onPointerleave = () => setIsTextVisible(false)

		document.addEventListener('pointerdown', checkVisibility)
		document.addEventListener('pointermove', checkVisibility)
		container.addEventListener('pointerleave', onPointerleave)
		return () => {
			document.removeEventListener('pointerup', checkVisibility)
			document.removeEventListener('pointermove', checkVisibility)
			container.removeEventListener('pointerleave', onPointerleave)
		}
	}, [hairRef, isDragging, topRef, viewportRef])

	const origin = topRef.current?.getBoundingClientRect()
	const pinWidth = origin?.width || 0

	const textWidth = textRef.current?.getBoundingClientRect().width || 0
	return (
		<div
			className={style.timeIndicator}
			style={{
				left: left - pinWidth / 2,
			}}
			ref={indicatorRef}
		>
			<span
				className={style.timeIndicatorText}
				ref={textRef}
				style={{
					top: (origin?.top || 0) - 1.8 * (origin?.height || 0),
					left: (origin?.left || 0) + pinWidth / 2 - textWidth / 2,
					visibility: isTextVisible ? 'visible' : 'hidden',
				}}
			>
				{text}
			</span>
			<span className={style.timeIndicatorTop} ref={topRef} />
			<span className={style.timeIndicatorHair} ref={hairRef}></span>
		</div>
	)
}
export default TimeIndicator

import { RefObject, useLayoutEffect, useRef, useState } from 'react'

import style from './TimeIndicator.module.scss'
interface Props {
	left: number
	topRef: RefObject<HTMLElement>
	hairRef: RefObject<HTMLElement>
	text?: string
	isDragging?: boolean
}
const TIME_INDICATOR_ACTIVATION_RADIUS = 20
const TimeIndicator = ({ left, topRef, hairRef, text, isDragging }: Props) => {
	const indicatorRef = useRef<HTMLDivElement>(null)
	const textRef = useRef<HTMLElement>(null)
	const [isTextVisible, setIsTextVisible] = useState(false)

	useLayoutEffect(() => {
		const topElem = topRef.current
		const hairElem = hairRef.current
		const container = indicatorRef.current
		if (!topElem || !hairElem || !container) {
			return
		}

		const isClose = (event: MouseEvent) => {
			const bbox = topElem.getBoundingClientRect()
			const topCenterX = bbox.left + bbox.width / 2
			const topCenterY = bbox.top + bbox.height / 2
			const { clientX, clientY } = event
			const pointerX = document.documentElement.scrollLeft + clientX
			const pointerY = document.documentElement.scrollTop + clientY
			return (
				(pointerX - topCenterX) ** 2 + (pointerY - topCenterY) ** 2 <
				TIME_INDICATOR_ACTIVATION_RADIUS ** 2
			)
		}

		const onPointermove = (event: MouseEvent) => {
			setIsTextVisible(isClose(event))
		}

		const onPointerleave = () => setIsTextVisible(false)

		container.addEventListener('pointermove', onPointermove)
		container.addEventListener('pointerleave', onPointerleave)
		return () => {
			container.removeEventListener('pointermove', onPointermove)
			container.removeEventListener('pointermove', onPointerleave)
		}
	}, [hairRef, topRef])
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
					visibility:
						isTextVisible || isDragging ? 'visible' : 'hidden',
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

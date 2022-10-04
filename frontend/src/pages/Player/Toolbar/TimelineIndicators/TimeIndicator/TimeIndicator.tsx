import { RefObject, useLayoutEffect, useRef, useState } from 'react'

import style from './TimeIndicator.module.scss'
interface Props {
	left: number
	topRef: RefObject<HTMLElement>
	hairRef: RefObject<HTMLElement>
	text?: string
	hideText?: boolean
}
const TimeIndicator = ({ left, topRef, hairRef, text, hideText }: Props) => {
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

			return (
				(clientX - topCenterX) ** 2 + (clientY - topCenterY) ** 2 < 300
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
					top: (origin?.top || 0) - 24,
					left: (origin?.left || 0) + pinWidth / 2 - textWidth / 2,
					visibility:
						isTextVisible && !hideText ? 'visible' : 'hidden',
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

import classNames from 'classnames'
import { RefObject, useLayoutEffect, useRef, useState } from 'react'

import style from './TimeIndicator.module.scss'
interface Props {
	left: number
	topRef: RefObject<HTMLElement>
	hairRef: RefObject<HTMLElement>
	viewportRef: RefObject<HTMLElement>
	text?: string
	isDragging?: boolean
	showHistogram?: boolean
}
const TIME_INDICATOR_ACTIVATION_RADIUS = 15
const TIME_INDICATOR_TOP_WIDTH = 10
const TimeIndicator = ({
	left,
	topRef,
	hairRef,
	text,
	isDragging,
	viewportRef,
	showHistogram,
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

		const viewportBbox = viewport.getBoundingClientRect()

		const isClose = (event: MouseEvent) => {
			const { clientX, clientY } = event
			if (clientX < viewportBbox.left || clientX > viewportBbox.right) {
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

	const textWidth = textRef.current?.getBoundingClientRect().width || 0
	return (
		<div
			className={classNames(style.timeIndicator, {
				[style.timeIndicatorMoving]: !isDragging,
			})}
			style={{
				left: left - TIME_INDICATOR_TOP_WIDTH / 2,
			}}
			ref={indicatorRef}
		>
			<span
				className={style.timeIndicatorText}
				ref={textRef}
				style={{
					top: (origin?.top || 0) - 2.1 * (origin?.height || 0),
					left:
						(origin?.left || 0) +
						TIME_INDICATOR_TOP_WIDTH / 2 -
						textWidth / 2,
					visibility: isTextVisible ? 'visible' : 'hidden',
				}}
			>
				{text}
			</span>
			<span className={style.timeIndicatorTop} ref={topRef} />
			<span
				className={classNames(style.timeIndicatorHair, {
					[style.hidden]: !showHistogram,
				})}
				ref={hairRef}
			></span>
		</div>
	)
}
export default TimeIndicator

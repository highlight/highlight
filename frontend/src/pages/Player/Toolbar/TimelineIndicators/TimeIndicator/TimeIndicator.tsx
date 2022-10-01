import { RefObject, useLayoutEffect, useRef, useState } from 'react'

import style from './TimeIndicator.module.scss'
interface Props {
	left: number
	topRef: RefObject<HTMLElement>
	hairRef: RefObject<HTMLElement>
	text?: string
}
const TimeIndicator = ({ left, topRef, hairRef, text }: Props) => {
	const textRef = useRef<HTMLElement>(null)
	const [isTextVisible, setIsTextVisible] = useState(false)

	useLayoutEffect(() => {
		const topElem = topRef.current
		const hairElem = hairRef.current
		if (!topElem || !hairElem) {
			return
		}
		const onMouseenter = () => setIsTextVisible(true)
		const onMouseleave = () => setIsTextVisible(false)

		topElem.addEventListener('mouseenter', onMouseenter)
		topElem.addEventListener('mouseleave', onMouseleave)
		hairElem.addEventListener('mouseenter', onMouseenter)
		hairElem.addEventListener('mouseleave', onMouseleave)
		return () => {
			topElem.removeEventListener('mouseenter', onMouseenter)
			topElem.removeEventListener('mouseeleave', onMouseleave)
			hairElem.removeEventListener('mouseenter', onMouseenter)
			hairElem.removeEventListener('mouseeleave', onMouseleave)
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
		>
			<span
				className={style.timeIndicatorText}
				ref={textRef}
				style={{
					top: (origin?.top || 0) - 24,
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

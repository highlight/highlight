import { TooltipPlacement } from 'antd/lib/tooltip'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import React from 'react'

import { EventsForTimeline } from '../../PlayerHook/utils'
import { ParsedEvent } from '../../ReplayerContext'
import { getAnnotationColor } from '../Toolbar'
import styles from './TimelineAnnotation.module.scss'

export const getPopoverPlacement = (relativeStartPercent: number) => {
	let offset = [-10, -10]
	let placement: TooltipPlacement = 'topLeft'
	if (relativeStartPercent > 0.67) {
		offset = [18, -10]
		placement = 'topRight'
	} else if (relativeStartPercent > 0.33) {
		offset = [0, -10]
		placement = 'top'
	}
	return { offset, placement }
}

interface Props {
	event: ParsedEvent
	colorKey: typeof EventsForTimeline[number]
	onClickHandler: () => void
	isSelected?: boolean
	hidden?: boolean
	isActive?: boolean
}

const ANIMATIONS = {
	resting: {
		initial: { opacity: 0, transform: 'scale(0)' },
		animate: { opacity: 0.5, transform: 'scale(1)' },
		exit: { opacity: 0, transform: 'scale(0)' },
		transition: {
			duration: 0.1,
			type: 'spring',
		},
	},
	active: {
		initial: { opacity: 0, transform: 'scale(0)', y: 0 },
		animate: { opacity: 1, transform: 'scale(1)', y: -24, scale: 1.2 },
		exit: { opacity: 0, transform: 'scale(0)', y: 0 },
		transition: {
			duration: 1,
			type: 'spring',
			repeat: Infinity,
			repeatType: 'mirror',
		},
	},
}
const TimelineAnnotation = ({
	event,
	colorKey,
	onClickHandler,
	isSelected,
	hidden,
	isActive,
	...props
}: Props) => {
	const baseStyles = {
		left: `calc(${event.relativeIntervalPercentage}% - calc(var(--size) / 2))`,
		backgroundColor: `var(${getAnnotationColor(colorKey)})`,
	}

	if (hidden) {
		return null
	}

	const animation = isActive ? ANIMATIONS['active'] : ANIMATIONS['resting']

	return (
		<motion.button
			{...props}
			key={`${event.relativeIntervalPercentage}-${event.type}`}
			{...animation}
			whileHover={{
				opacity: 1,
				transform: `scale(1.2)`,
				zIndex: 25,
			}}
			whileFocus={{
				opacity: 1,
				transform: `scale(1.2)`,
				zIndex: 25,
			}}
			className={classNames(styles.annotation, {
				[styles.selected]: isSelected,
			})}
			style={baseStyles}
			onClick={onClickHandler}
		></motion.button>
	)
}

export default TimelineAnnotation

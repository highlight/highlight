import SvgCheckmarkIcon from '@icons/CheckmarkIcon'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

import styles from './CardSelect.module.scss'

type Props = {
	title: string
	description: string
	onClick: () => void
	isSelected: boolean
	descriptionClass?: string
}

const CardSelect = ({
	description,
	isSelected,
	onClick,
	title,
	descriptionClass,
}: Props) => {
	return (
		<button onClick={onClick} type="button" className={styles.button}>
			{/*
		    // TODO - we need to update the framer-motion package to pull the new type definitions
		    // https://github.com/framer/motion/pull/1507
			  // @ts-expect-error*/}
			<AnimatePresence>
				{isSelected && (
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0 }}
						className={styles.icon}
					>
						<SvgCheckmarkIcon />
					</motion.div>
				)}
			</AnimatePresence>

			<h4>{title}</h4>
			<p className={descriptionClass}>{description}</p>
		</button>
	)
}

export default CardSelect

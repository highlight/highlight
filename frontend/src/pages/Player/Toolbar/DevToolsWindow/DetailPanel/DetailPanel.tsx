import PanelToggleButton from '@pages/Player/components/PanelToggleButton/PanelToggleButton'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import { useParams } from '@util/react-router/useParams'
import classNames from 'classnames'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import { Resizable } from 're-resizable'
import React, { useEffect } from 'react'

import styles from './DetailPanel.module.scss'

const DetailPanel = () => {
	const { detailedPanel, setDetailedPanel } = usePlayerUIContext()
	const { showBanner } = useGlobalContext()
	const { session_secure_id } = useParams<{
		session_secure_id: string
	}>()

	useEffect(() => {
		setDetailedPanel(undefined)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session_secure_id])

	return (
		// TODO - we need to update the framer-motion package to pull the new type definitions
		// https://github.com/framer/motion/pull/1507
		// @ts-expect-error
		<AnimatePresence presenceAffectsLayout>
			{!detailedPanel ? null : (
				<Resizable
					enable={{ left: true }}
					className={styles.resizeContainer}
					defaultSize={{
						width: '350',
						height: 'fit-content',
					}}
					minWidth="300"
					maxWidth="90vw"
					handleComponent={{
						left: <DragHandle />,
					}}
					handleWrapperClass={classNames(styles.dragHandleWrapper)}
				>
					<motion.div
						key="detailPanel"
						className={classNames(styles.detailPanel, {
							[styles.padding]: !detailedPanel.options?.noPadding,
							[styles.bannerShown]: showBanner,
						})}
						initial={{ transform: 'translateX(110%)' }}
						animate={{ transform: 'translateX(0%)' }}
						exit={{ transform: 'translateX(110%)' }}
					>
						<PanelToggleButton
							className={classNames(styles.toggleButton)}
							direction="right"
							isOpen={true}
							onClick={() => {
								setDetailedPanel(undefined)
							}}
						/>
						{!detailedPanel.options?.noHeader && (
							<div className={styles.header}>
								<h3 className={styles.title}>
									{detailedPanel.title}
								</h3>
							</div>
						)}

						<div className={styles.contentContainer}>
							{detailedPanel.content}
						</div>
					</motion.div>
				</Resizable>
			)}
		</AnimatePresence>
	)
}

export default DetailPanel

const DragHandle = () => {
	const isPresent = useIsPresent()

	return (
		<div
			className={classNames(styles.dragHandle, {
				[styles.hidden]: !isPresent,
			})}
		></div>
	)
}

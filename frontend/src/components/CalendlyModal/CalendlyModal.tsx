import { Button } from '@components/Button'
import { useGetBillingDetailsForProjectQuery } from '@graph/hooks'
import {
	Box,
	ButtonIcon,
	IconSolidCalendar,
	IconSolidXCircle,
	Stack,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import { getAttributionData } from '@util/attribution'
import { isProjectWithinTrial } from '@util/billing/billing'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import { InlineWidget } from 'react-calendly'
import { useHotkeys } from 'react-hotkeys-hook'

import { styledVerticalScrollbar } from '@/style/common.css'

import * as style from './styles.css'

export function Calendly() {
	const { referral } = getAttributionData()
	let utm = {}
	try {
		utm = JSON.parse(referral)
	} catch (e) {}
	return (
		<InlineWidget
			url="https://calendly.com/highlight-io/discussion"
			styles={{ width: '100%', height: '100%' }}
			utm={utm}
		/>
	)
}

export function CalendlyModal() {
	const { projectId } = useProjectId()
	const { data } = useGetBillingDetailsForProjectQuery({
		variables: {
			project_id: projectId,
		},
	})
	const [calendlyOpen, setCalendlyOpen] = useState(false)
	const hasTrial = isProjectWithinTrial(data?.workspace_for_project)

	useHotkeys(
		'escape',
		() => {
			setCalendlyOpen(false)
		},
		[],
	)

	return (
		<>
			<Button
				kind={hasTrial ? 'primary' : 'secondary'}
				size="small"
				emphasis="high"
				iconLeft={<IconSolidCalendar />}
				onClick={() => setCalendlyOpen(true)}
				trackingId="ClickCalendlyOpen"
			>
				Book a call
			</Button>
			<AnimatePresence>
				{calendlyOpen ? (
					<motion.div
						key="calendlyWrapper"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0, display: 'none' }}
						transition={{
							duration: 3,
						}}
					>
						<Box
							display="flex"
							height="screen"
							width="screen"
							position="fixed"
							alignItems="flex-start"
							justifyContent="center"
							style={{
								top: 0,
								left: 0,
								zIndex: '90',
								overflow: 'hidden',
								backgroundColor: '#6F6E777A',
							}}
							onClick={() => setCalendlyOpen(false)}
						>
							<Stack
								cssClass={clsx(
									styledVerticalScrollbar,
									style.modalInner,
								)}
								onClick={() => setCalendlyOpen(false)}
							>
								<Calendly />
								<ButtonIcon
									shape="square"
									emphasis="low"
									kind="secondary"
									onClick={() => setCalendlyOpen(false)}
									icon={<IconSolidXCircle size="32" />}
									cssClass={style.closeIcon}
								/>
							</Stack>
						</Box>
					</motion.div>
				) : null}
			</AnimatePresence>
		</>
	)
}

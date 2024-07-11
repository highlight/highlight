import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import { useGetBillingDetailsForProjectQuery } from '@graph/hooks'
import {
	Box,
	ButtonIcon,
	ButtonProps,
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
import { createPortal } from 'react-dom'
import { useHotkeys } from 'react-hotkeys-hook'

import { styledVerticalScrollbar } from '@/style/common.css'

import * as style from './styles.css'

interface Referrer {
	utm_source?: string | null
	utm_medium?: string | null
	utm_campaign?: string | null
	utm_content?: string | null
	utm_term?: string | null
}

function getCalendlyUtm() {
	const urlParams = new URLSearchParams(window.location.search)
	const { referral } = getAttributionData()
	let referrer: Referrer = {}
	try {
		referrer = JSON.parse(referral)
	} catch (e) {}
	const utm = {
		utmCampaign:
			referrer.utm_campaign ?? urlParams?.get('utm_campaign') ?? '',
		utmSource: referrer.utm_source ?? urlParams?.get('utm_source') ?? '',
		utmMedium: referrer.utm_medium ?? urlParams?.get('utm_medium') ?? '',
		utmContent: referrer.utm_content ?? urlParams?.get('utm_content') ?? '',
		utmTerm: referrer.utm_term ?? urlParams?.get('utm_term') ?? '',
	}
	return {
		...utm,
		url: `https://calendly.com/highlight-io/application-support-sales?utm_campaign=${utm.utmCampaign}&utm_source=${utm.utmSource}&utm_medium=${utm.utmMedium}&utm_content=${utm.utmContent}&utm_term=${utm.utmTerm}`,
	}
}
export function Calendly({ howCanWeHelp }: { howCanWeHelp?: string }) {
	const { admin } = useAuthContext()
	const { url: _, ...utm } = getCalendlyUtm()
	return (
		<InlineWidget
			url="https://calendly.com/highlight-io/application-support-sales"
			styles={{ width: '100%', height: '100%' }}
			utm={utm}
			prefill={{
				name: admin?.name,
				email: admin?.email,
				customAnswers: {
					a1: howCanWeHelp,
				},
			}}
			LoadingSpinner={() => null}
			pageSettings={{}}
		/>
	)
}

export function CalendlyModal({
	onClose,
	howCanWeHelp,
}: {
	onClose: () => void
	howCanWeHelp?: string
}) {
	const portalRoot = document.getElementById('portal')!
	return createPortal(
		<AnimatePresence>
			<motion.div
				key="calendlyWrapper"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0, display: 'none' }}
				transition={{
					duration: 2,
				}}
				style={{
					position: 'absolute',
					zIndex: '20001', // +1 more than the header z-index
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
						overflow: 'hidden',
						backgroundColor: '#6F6E777A',
					}}
					onClick={onClose}
				>
					<Stack
						cssClass={clsx(
							styledVerticalScrollbar,
							style.modalInner,
						)}
						onClick={onClose}
					>
						<Calendly howCanWeHelp={howCanWeHelp ?? ''} />
						<ButtonIcon
							shape="square"
							emphasis="low"
							kind="secondary"
							onClick={onClose}
							icon={<IconSolidXCircle size="32" />}
							cssClass={style.closeIcon}
						/>
					</Stack>
				</Box>
			</motion.div>
		</AnimatePresence>,
		portalRoot,
	)
}

export function CalendlyButton({
	text,
	howCanWeHelp,
	onClick,
	...props
}: {
	text?: string
	howCanWeHelp?: string
	onClick?: () => void
} & ButtonProps) {
	const { projectId } = useProjectId()
	const { data } = useGetBillingDetailsForProjectQuery({
		variables: {
			project_id: projectId,
		},
	})
	const [calendlyOpen, setCalendlyOpen] = useState(false)
	const hasTrial = isProjectWithinTrial(data?.project?.workspace)

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
				onClick={() => {
					if (onClick) {
						onClick()
					} else {
						setCalendlyOpen(true)
					}
				}}
				trackingId="ClickCalendlyOpen"
				{...props}
			>
				{text ?? 'Book a call'}
			</Button>
			{calendlyOpen ? (
				<CalendlyModal
					howCanWeHelp={howCanWeHelp}
					onClose={() => setCalendlyOpen(false)}
				/>
			) : null}
		</>
	)
}

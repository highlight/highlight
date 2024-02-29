import {
	Badge,
	Box,
	Callout,
	Heading,
	Stack,
	Tabs,
} from '@highlight-run/ui/components'
import moment from 'moment'
import React, { useEffect, useState } from 'react'

import LoadingBox from '@/components/LoadingBox'
import { RelatedResourceButtons } from '@/pages/Traces/RelatedResourceButtons'
import { TraceErrors } from '@/pages/Traces/TraceErrors'
import { TraceFlameGraph } from '@/pages/Traces/TraceFlameGraph'
import { TraceLogs } from '@/pages/Traces/TraceLogs'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { TraceSpanAttributes } from '@/pages/Traces/TraceSpanAttributes'
import analytics from '@/util/analytics'

import * as styles from './TracePage.css'

enum TraceTabs {
	Info = 'Info',
	Errors = 'Errors',
	Logs = 'Logs',
}

export const TracePage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TraceTabs>(TraceTabs.Info)
	const {
		durationString,
		errors,
		highlightedSpan,
		loading,
		startTime,
		endTime,
		traces,
		traceName,
		traceId,
		secureSessionId,
		selectedSpan,
	} = useTrace()

	useEffect(() => {
		analytics.page('Trace')
	}, [traceId])

	if (!traces?.length) {
		return loading ? (
			<LoadingBox />
		) : (
			<Box p="8">
				<Callout kind="error" title="Trace not found" />
			</Box>
		)
	}

	return (
		<Box cssClass={styles.container} overflowY="scroll">
			<Stack direction="column" gap="12" pt="16" pb="12" px="20">
				<Heading level="h4">{traceName}</Heading>
				<Stack direction="row" justifyContent="space-between">
					<Stack gap="4" direction="row">
						<Badge
							size="medium"
							variant="gray"
							label={moment(startTime).format('MMM D HH:mm:ss A')}
						/>
						<Badge
							size="medium"
							variant="gray"
							label={durationString}
						/>
					</Stack>
					<RelatedResourceButtons
						traceId={traceId}
						secureSessionId={secureSessionId}
						disableErrors={!errors?.length}
						displayErrorTooltip={
							selectedSpan?.hasErrors && !errors?.length
						}
						startDate={new Date(startTime)}
						endDate={new Date(endTime)}
					/>
				</Stack>
			</Stack>

			<Box px="20">
				<TraceFlameGraph />
			</Box>

			<Box pt="20">
				<Tabs<TraceTabs>
					tab={activeTab}
					setTab={(tab) => setActiveTab(tab)}
					containerClass={styles.tabs}
					tabsContainerClass={styles.tabsContainer}
					pageContainerClass={styles.tabsPageContainer}
					pages={{
						[TraceTabs.Info]: {
							page: (
								<Box p="8">
									<TraceSpanAttributes
										span={highlightedSpan!}
									/>
								</Box>
							),
						},
						[TraceTabs.Errors]: {
							badge:
								errors?.length > 0 ? (
									<Badge
										variant="gray"
										label={String(errors.length)}
									/>
								) : undefined,
							page: (
								<Box p="8">
									<TraceErrors />
								</Box>
							),
						},
						[TraceTabs.Logs]: {
							page: (
								<Box p="8">
									<TraceLogs />
								</Box>
							),
						},
					}}
					noHandle
				/>
			</Box>
		</Box>
	)
}

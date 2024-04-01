import { Badge, Box, Callout, Tabs } from '@highlight-run/ui/components'
import React, { useEffect, useState } from 'react'

import LoadingBox from '@/components/LoadingBox'
import { TraceErrors } from '@/pages/Traces/TraceErrors'
import { TraceFlameGraph } from '@/pages/Traces/TraceFlameGraph'
import { TraceHeader } from '@/pages/Traces/TraceHeader'
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
	const { errors, highlightedSpan, loading, traces, traceId } = useTrace()

	useEffect(() => {
		analytics.page('Trace')
	}, [traceId])

	if (!traces?.length) {
		return loading ? (
			<LoadingBox />
		) : (
			<Box p="36">
				<Callout kind="error" title="Trace not found" />
			</Box>
		)
	}

	return (
		<Box overflowY="scroll" px="36" pt="28" pb="20">
			<TraceHeader />
			<TraceFlameGraph />

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
								<Box px="6">
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
							page: <TraceErrors />,
						},
						[TraceTabs.Logs]: {
							page: <TraceLogs />,
						},
					}}
					noHandle
				/>
			</Box>
		</Box>
	)
}

import { Box, Callout, Tabs } from '@highlight-run/ui/components'
import React, { useEffect, useState } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'

import LoadingBox from '@/components/LoadingBox'
import { TraceErrors } from '@/pages/Traces/TraceErrors'
import { TraceFlameGraph } from '@/pages/Traces/TraceFlameGraph'
import { TraceHeader } from '@/pages/Traces/TraceHeader'
import { TraceLogs } from '@/pages/Traces/TraceLogs'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { TraceSpanAttributes } from '@/pages/Traces/TraceSpanAttributes'
import analytics from '@/util/analytics'

enum TraceTabs {
	Info = 'Info',
	Errors = 'Errors',
	Logs = 'Logs',
}

export const TracePage: React.FC = () => {
	const [query] = useQueryParam('query', StringParam)
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
				<Tabs<TraceTabs> selectedId={activeTab} onChange={setActiveTab}>
					<Tabs.List>
						<Tabs.Tab id={TraceTabs.Info}>Info</Tabs.Tab>
						<Tabs.Tab
							id={TraceTabs.Errors}
							badgeText={errors?.length.toString()}
						>
							Errors
						</Tabs.Tab>
						<Tabs.Tab id={TraceTabs.Logs}>Logs</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel id={TraceTabs.Info}>
						<Box pt="8" px="4">
							<TraceSpanAttributes
								span={highlightedSpan!}
								query={query!}
							/>
						</Box>
					</Tabs.Panel>
					<Tabs.Panel id={TraceTabs.Errors}>
						<TraceErrors />
					</Tabs.Panel>
					<Tabs.Panel id={TraceTabs.Logs}>
						<Box pt="8">
							<TraceLogs />
						</Box>
					</Tabs.Panel>
				</Tabs>
			</Box>
		</Box>
	)
}

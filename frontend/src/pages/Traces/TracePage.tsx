import { Badge, Box, Heading, Stack, Tabs, Text } from '@highlight-run/ui'
import moment from 'moment'
import React, { useState } from 'react'

import LoadingBox from '@/components/LoadingBox'
import { TraceErrors } from '@/pages/Traces/TraceErrors'
import { TraceFlameGraph } from '@/pages/Traces/TraceFlameGraph'
import { TraceLogs } from '@/pages/Traces/TraceLogs'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { TraceSpanAttributes } from '@/pages/Traces/TraceSpanAttributes'

import * as styles from './TracePage.css'

enum TraceTabs {
	Info = 'Info',
	Errors = 'Errors',
	Logs = 'Logs',
}

type Props = {}

export const TracePage: React.FC<Props> = () => {
	const [activeTab, setActiveTab] = useState<TraceTabs>(TraceTabs.Info)
	const {
		durationString,
		errors,
		highlightedSpan,
		loading,
		startTime,
		traces,
		traceName,
	} = useTrace()

	if (!traces?.length) {
		return loading ? (
			<LoadingBox />
		) : (
			<Box>
				<Text>Trace not found</Text>
			</Box>
		)
	}

	return (
		<Box cssClass={styles.container}>
			<Stack direction="column" gap="16" mb="12" mt="8">
				<Heading>{traceName}</Heading>
				<Box
					display="flex"
					alignItems="center"
					flexDirection="row"
					gap="8"
				>
					<Text color="moderate">
						{moment(startTime).format('MMM D HH:mm:ss.SSS')}
					</Text>
					<Text weight="bold">{durationString}</Text>
				</Box>
			</Stack>

			<TraceFlameGraph />

			<Box mt="12">
				<Tabs<TraceTabs>
					tab={activeTab}
					setTab={(tab) => setActiveTab(tab)}
					containerClass={styles.tabs}
					tabsContainerClass={styles.tabsContainer}
					pageContainerClass={styles.tabsPageContainer}
					pages={{
						[TraceTabs.Info]: {
							page: (
								<TraceSpanAttributes span={highlightedSpan!} />
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

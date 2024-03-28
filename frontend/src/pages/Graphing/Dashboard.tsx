import { Badge, Box, Button, Text } from '@highlight-run/ui/components'
import moment from 'moment'
import { useState } from 'react'
import { Helmet } from 'react-helmet'

import { cmdKey } from '@/components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import { useGetVisualizationQuery } from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import Graph, { getViewConfig } from '@/pages/Graphing/components/Graph'

import * as style from './Dashboard.css'

export const Dashboard = () => {
	const { projectId } = useProjectId()
	const { data } = useGetVisualizationQuery({ variables: { id: '1' } })

	const [endDate] = useState(moment().toISOString())
	const [startDate] = useState(moment().subtract(4, 'hours').toISOString())

	return (
		<>
			<Helmet>
				<title>Edit Metric View</title>
			</Helmet>
			<Box
				background="n2"
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
			>
				<Box
					background="white"
					borderRadius="6"
					flexDirection="column"
					display="flex"
					flexGrow={1}
					border="dividerWeak"
					shadow="medium"
				>
					<Box
						width="full"
						cssClass={style.editGraphHeader}
						borderBottom="dividerWeak"
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						paddingLeft="12"
						paddingRight="8"
						py="6"
					>
						<Text size="small" weight="medium">
							Edit Metric View
						</Text>
						<Box display="flex" gap="4">
							<Button emphasis="low" kind="secondary">
								Cancel
							</Button>
							<Button>
								Create metric view&nbsp;
								<Badge
									variant="outlinePurple"
									shape="basic"
									size="small"
									label={[cmdKey, 'S'].join('+')}
								/>
							</Button>
						</Box>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
						height="full"
					>
						<Box
							display="flex"
							position="relative"
							width="full"
							height="full"
						>
							{data?.visualization.graphs.map((g, idx) => {
								return (
									<Graph
										key={idx}
										title={g.title}
										viewConfig={getViewConfig(
											g.type,
											g.display ?? undefined,
											g.nullHandling ?? undefined,
										)}
										productType={g.productType}
										projectId={projectId}
										startDate={startDate}
										endDate={endDate}
										query={g.query}
										metric={g.metric}
										functionType={g.functionType}
										bucketByKey={g.bucketByKey ?? undefined}
										bucketCount={g.bucketCount ?? undefined}
										groupByKey={g.groupByKey ?? undefined}
										limit={g.limit ?? undefined}
										limitFunctionType={
											g.limitFunctionType ?? undefined
										}
										limitMetric={g.limitMetric ?? undefined}
									/>
								)
							})}
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}

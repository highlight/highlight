import { Box, Button, IconSolidPlus, Text } from '@highlight-run/ui/components'
import moment from 'moment'
import { useState } from 'react'
import { Helmet } from 'react-helmet'

import { useGetVisualizationQuery } from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import Graph, { getViewConfig } from '@/pages/Graphing/components/Graph'

import * as style from './Dashboard.css'

export const Dashboard = () => {
	const { projectId } = useProjectId()
	const { data } = useGetVisualizationQuery({ variables: { id: '1' } })

	const [endDate] = useState(moment().toISOString())
	const [startDate] = useState(moment().subtract(4, 'days').toISOString())

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
							Dashboard title
						</Text>
						<Box display="flex" gap="4">
							<Button emphasis="low" kind="secondary">
								Share
							</Button>
							<Button
								emphasis="medium"
								kind="secondary"
								iconLeft={<IconSolidPlus />}
							>
								Add graph
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
							<Box cssClass={style.graphGrid}>
								{data?.visualization.graphs.map((g, idx) => {
									return (
										<Box
											key={idx}
											px="16"
											py="12"
											cssClass={style.graphDivider}
										>
											<Graph
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
												bucketByKey={
													g.bucketByKey ?? undefined
												}
												bucketCount={
													g.bucketCount ?? undefined
												}
												groupByKey={
													g.groupByKey ?? undefined
												}
												limit={g.limit ?? undefined}
												limitFunctionType={
													g.limitFunctionType ??
													undefined
												}
												limitMetric={
													g.limitMetric ?? undefined
												}
												showMenu
											/>
										</Box>
									)
								})}
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}

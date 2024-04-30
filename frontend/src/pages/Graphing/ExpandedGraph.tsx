import {
	Box,
	Button,
	DateRangePicker,
	DEFAULT_TIME_PRESETS,
	IconSolidChartBar,
	IconSolidCheveronRight,
	presetStartDate,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { Helmet } from 'react-helmet'
import { Link, useNavigate } from 'react-router-dom'

import { useGetVisualizationQuery } from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import Graph, { getViewConfig } from '@/pages/Graphing/components/Graph'
import { HeaderDivider } from '@/pages/Graphing/Dashboard'
import { useParams } from '@/util/react-router/useParams'

import * as style from './Dashboard.css'

export const ExpandedGraph = () => {
	const { dashboard_id, graph_id } = useParams<{
		dashboard_id: string
		graph_id: string
	}>()

	const { projectId } = useProjectId()

	const { data } = useGetVisualizationQuery({
		variables: { id: dashboard_id! },
	})

	const { startDate, endDate, selectedPreset, updateSearchTime } =
		useSearchTime({
			presets: DEFAULT_TIME_PRESETS,
			initialPreset: DEFAULT_TIME_PRESETS[2],
		})

	const navigate = useNavigate()

	const g = data?.visualization.graphs.find((g) => g.id === graph_id)
	if (g === undefined) {
		return null
	}

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
						<Stack
							display="flex"
							direction="row"
							alignItems="center"
							gap="4"
						>
							<Link to="..">
								<Stack>
									<Tag
										shape="basic"
										size="medium"
										kind="secondary"
										iconLeft={<IconSolidChartBar />}
									>
										Dashboards
									</Tag>
								</Stack>
							</Link>
							<IconSolidCheveronRight
								color={vars.theme.static.content.weak}
							/>
							<Text size="small" weight="medium" color="default">
								{data?.visualization.name}
							</Text>
						</Stack>
						<Box display="flex" gap="4">
							<DateRangePicker
								emphasis="low"
								kind="secondary"
								selectedValue={{
									startDate,
									endDate,
									selectedPreset,
								}}
								onDatesChange={updateSearchTime}
								presets={DEFAULT_TIME_PRESETS}
								minDate={presetStartDate(
									DEFAULT_TIME_PRESETS[5],
								)}
							/>
							<HeaderDivider />
							<Button
								emphasis="low"
								kind="secondary"
								onClick={() => {
									navigate({
										pathname: `../${dashboard_id}`,
										search: location.search,
									})
								}}
							>
								Cancel
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
							px="12"
							py="16"
						>
							<Graph
								title={g.title}
								viewConfig={getViewConfig(
									g.type,
									g.display,
									g.nullHandling,
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
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}

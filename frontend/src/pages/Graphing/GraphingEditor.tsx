import { Badge, Box, Button, Text } from '@highlight-run/ui/components'
import { Helmet } from 'react-helmet'

import { cmdKey } from '@/components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import Graph from '@/pages/Graphing/components/Graph'

import * as style from './GraphingEditor.css'

export const GraphingEditor = () => {
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
					<Box display="flex" cssClass={style.graphWrapper}>
						<Graph
							data={[1, 2, 10, 3, 2, 1, 1, 3, 5, 2, 3, 4].map(
								(val, idx) => ({
									xAxis: idx,
									series1: val,
									series2: val + (idx * idx) / 8,
								}),
							)}
							chartLabel="Graph title"
							yAxisLabel="yAxisLabel"
							xAxisKey="xAxis"
							strokeColor="#000000"
							fillColor="#555555"
						/>
					</Box>
				</Box>
			</Box>
		</>
	)
}

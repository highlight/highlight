import { Box, Tabs } from '@highlight-run/ui/components'

import { TraceFlameGraph } from '@/pages/Traces/TraceFlameGraph'
import { TraceWaterfallList } from '@/pages/Traces/TraceWaterfallList'

type Props = React.PropsWithChildren & {}

enum TraceVisualizerTab {
	FlameGraph = 'Flame Graph',
	Waterfall = 'Waterfall',
}

export const TraceVisualizer: React.FC<Props> = () => {
	return (
		<Tabs<TraceVisualizerTab>>
			<Tabs.List>
				<Tabs.Tab id={TraceVisualizerTab.FlameGraph}>
					{TraceVisualizerTab.FlameGraph}
				</Tabs.Tab>
				<Tabs.Tab id={TraceVisualizerTab.Waterfall}>
					{TraceVisualizerTab.Waterfall}
				</Tabs.Tab>
			</Tabs.List>
			<Box mt="10">
				<Tabs.Panel id={TraceVisualizerTab.FlameGraph}>
					<TraceFlameGraph />
				</Tabs.Panel>
				<Tabs.Panel id={TraceVisualizerTab.Waterfall}>
					<TraceWaterfallList />
				</Tabs.Panel>
			</Box>
		</Tabs>
	)
}

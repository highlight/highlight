import {
	Funnel,
	FunnelChart as RechartsFunnelChart,
	LabelList,
	ResponsiveContainer,
	Tooltip,
} from 'recharts'

import {
	AxisConfig,
	InnerChartProps,
	SeriesInfo,
	TooltipConfig,
} from '@/pages/Graphing/components/Graph'

export type FunnelDisplay = 'TODO'
export const FUNNEL_DISPLAY: FunnelDisplay[] = ['TODO']

export type FunnelChartConfig = {
	type: 'Funnel chart'
	showLegend: boolean
	display?: FunnelDisplay
}

export const FunnelChart = ({
	data,
	children,
}: React.PropsWithChildren<
	InnerChartProps<FunnelChartConfig> & SeriesInfo & AxisConfig & TooltipConfig
>) => {
	return (
		<ResponsiveContainer height="100%" width="100%">
			<RechartsFunnelChart width={500} height={500}>
				{children}
				<Tooltip />
				<Funnel
					dataKey="value"
					data={data?.map((d) => {
						// TODO(vkorolik)
						console.log('vadim', { d })
						return {
							value: d[d.Group] ?? d.Count,
							name: d.Group,
							fill: '#8884d8',
						}
					})}
					isAnimationActive
				>
					<LabelList
						position="right"
						fill="#000"
						stroke="none"
						dataKey="name"
					/>
				</Funnel>
			</RechartsFunnelChart>
		</ResponsiveContainer>
	)
}

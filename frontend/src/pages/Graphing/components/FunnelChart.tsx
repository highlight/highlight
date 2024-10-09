import { Box, Text } from '@highlight-run/ui/components'
import * as style from '@pages/Graphing/components/Graph.css'
import {
	Funnel,
	FunnelChart as RechartsFunnelChart,
	LabelList,
	LabelProps,
	ResponsiveContainer,
	Tooltip,
} from 'recharts'

import {
	AxisConfig,
	getColor,
	InnerChartProps,
	SeriesInfo,
} from '@/pages/Graphing/components/Graph'
import { FunnelDisplay } from '@pages/Graphing/components/types'

const getCustomLabel = () => (props: LabelProps) => {
	return (
		<Box cssClass={style.labelWrapper}>
			<Text
				size="xxSmall"
				weight="medium"
				color="default"
				cssClass={style.labelText}
			>
				{props.name}
			</Text>
		</Box>
	)
}

const getCustomTooltip =
	(data: any[] | undefined) =>
	({ payload }: any) => {
		if (!data?.at(0)) return null
		const initialValue = data[0][data[0].Group]
		return (
			<Box cssClass={style.tooltipWrapper}>
				{payload.map((p: any, idx: number) => (
					<Box
						display="flex"
						flexDirection="column"
						justifyContent="center"
						alignItems="center"
						gap="16"
						padding="8"
						key={idx}
					>
						<Text
							size="small"
							weight="medium"
							color="default"
							cssClass={style.tooltipText}
						>
							{p.name || '<empty>'}
						</Text>
						<Text
							size="small"
							weight="bold"
							color="default"
							cssClass={style.tooltipText}
						>
							{p.value + ' sessions: '}
							{((100 * p.value) / initialValue).toFixed(1)}%
						</Text>
					</Box>
				))}
			</Box>
		)
	}

export type FunnelChartConfig = {
	type: 'Funnel chart'
	showLegend: boolean
	display?: FunnelDisplay
}

export const FunnelChart = ({
	data,
	children,
}: React.PropsWithChildren<
	InnerChartProps<FunnelChartConfig> & SeriesInfo & AxisConfig
>) => {
	return (
		<ResponsiveContainer height="100%" width="100%">
			<RechartsFunnelChart width={500} height={500}>
				{children}
				<Tooltip
					content={getCustomTooltip(data)}
					wrapperStyle={{ zIndex: 100 }}
					cursor={{ fill: '#C8C7CB', fillOpacity: 0.5 }}
					isAnimationActive={false}
				/>
				<Funnel
					dataKey="value"
					data={data?.map((d) => ({
						value: d[d.Group] ?? d.Count,
						name: d.Group,
						fill: getColor(0, ''),
					}))}
					isAnimationActive={false}
				>
					<LabelList position="right" content={getCustomLabel()} />
				</Funnel>
			</RechartsFunnelChart>
		</ResponsiveContainer>
	)
}

import { Box, Text } from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
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
	InnerChartProps,
	SeriesInfo,
	TooltipConfig,
} from '@/pages/Graphing/components/Graph'

export type FunnelDisplay = 'Funnel Steps'
export const FUNNEL_DISPLAY: FunnelDisplay[] = ['Funnel Steps']

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
	(data: any[]) =>
	({ payload }: any) => {
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
							{p.name}
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
	InnerChartProps<FunnelChartConfig> & SeriesInfo & AxisConfig & TooltipConfig
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
						fill: vars.color.p9,
					}))}
					isAnimationActive
				>
					<LabelList
						position="right"
						fill="#000"
						stroke="none"
						dataKey="name"
						content={getCustomLabel()}
					/>
				</Funnel>
			</RechartsFunnelChart>
		</ResponsiveContainer>
	)
}

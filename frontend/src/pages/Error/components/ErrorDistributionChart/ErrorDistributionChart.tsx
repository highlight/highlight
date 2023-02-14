import Card from '@components/Card/Card'
import { ErrorGroup, Maybe } from '@graph/schemas'
import { formatNumber } from '@util/numbers'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import {
	Bar,
	BarChart,
	LabelList,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts'

import { useGetErrorDistributionQuery } from '../../../../graph/generated/hooks'
import styles from './ErrorDistributionChart.module.scss'

type DistributionGraphProps = {
	errorGroup?: Maybe<Pick<ErrorGroup, 'secure_id' | 'project_id'>>
	field: string
	title: string
}

export const ErrorDistributionChart: React.FC<
	React.PropsWithChildren<DistributionGraphProps>
> = ({ errorGroup, field, title }) => {
	const [formattedData, setFormattedData] = useState<
		| ({
				formattedValue: string
				name: string
				value: any
		  } | null)[]
		| undefined
	>([])

	const { data } = useGetErrorDistributionQuery({
		variables: {
			project_id: `${errorGroup?.project_id}`,
			error_group_secure_id: `${errorGroup?.secure_id}`,
			property: field,
		},
	})

	const chartHeight = (data: Array<any> | undefined) => {
		if (data) {
			return data.length * 32
		}
		return 200
	}

	useEffect(() => {
		const d = data?.errorDistribution.map((o) =>
			o
				? {
						...o,
						value: o.value,
						formattedValue: formatNumber(o.value, 0),
				  }
				: o,
		)
		setFormattedData(d)
	}, [data])

	return formattedData && formattedData.length > 0 ? (
		<Card className={clsx(styles.distributionSection)} title={title}>
			<div className={styles.distributionChart}>
				<ResponsiveContainer
					width="100%"
					height={chartHeight(formattedData)}
				>
					<BarChart
						width={200}
						data={formattedData}
						layout="vertical"
						barSize={14}
						margin={{
							top: 5,
							right: 30,
							left: -20,
							bottom: 0,
						}}
					>
						<XAxis type="number" hide={true} />
						<YAxis
							type="category"
							dataKey="name"
							width={80}
							tick={{ fontSize: 10 }}
							tickLine={false}
							axisLine={false}
						/>
						<Bar dataKey="value" radius={2} fill="#5629c6">
							<LabelList
								dataKey="formattedValue"
								position="right"
								className={styles.chartLabel}
							/>
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</Card>
	) : (
		<></>
	)
}

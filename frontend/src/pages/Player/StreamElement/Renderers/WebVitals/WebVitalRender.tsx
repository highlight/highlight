import SimpleMetric, {
	DetailedMetric,
} from '@pages/Player/StreamElement/Renderers/WebVitals/components/Metric'
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils'
import analytics from '@util/analytics'
import clsx from 'clsx'
import React, { useEffect } from 'react'

import styles from './WebVitalRender.module.css'

interface Props {
	vitals: {
		name: string
		value: number
	}[]
	showDetailedView?: boolean
}
const WebVitalSimpleRenderer = React.memo(
	({ vitals, showDetailedView }: Props) => {
		useEffect(() => {
			if (showDetailedView) {
				analytics.track('ViewedWebVitalsDetails')
			}
		}, [showDetailedView])

		const deduppedVitals: {
			[name: string]: { name: string; value: number }
		} = {}
		for (const { name, value } of vitals) {
			deduppedVitals[name] = { name, value }
		}

		return (
			<div
				className={clsx({
					[styles.wrapper]: !showDetailedView,
					[styles.detailedView]: showDetailedView,
				})}
			>
				{Object.values(deduppedVitals).map(({ name, value }) => {
					const configuration = WEB_VITALS_CONFIGURATION[name]
					if (!configuration) {
						return null
					}

					if (showDetailedView) {
						return (
							<DetailedMetric
								key={name}
								configuration={configuration}
								value={value}
								name={name}
							/>
						)
					}
					return (
						<SimpleMetric
							key={name}
							configuration={configuration}
							value={value}
							name={name}
						/>
					)
				})}
			</div>
		)
	},
)

export default WebVitalSimpleRenderer

import SimpleMetric, {
	DetailedMetric,
} from '@pages/Player/StreamElement/Renderers/WebVitals/components/Metric'
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils'
import classNames from 'classnames'
import { H } from 'highlight.run'
import React, { useEffect } from 'react'

import styles from './WebVitalRender.module.scss'

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
				H.track('ViewedWebVitalsDetails')
			}
		}, [showDetailedView])

		return (
			<div
				className={classNames({
					[styles.wrapper]: !showDetailedView,
					[styles.detailedView]: showDetailedView,
				})}
			>
				{vitals.map(({ name, value }) => {
					const configuration = WEB_VITALS_CONFIGURATION[name]

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

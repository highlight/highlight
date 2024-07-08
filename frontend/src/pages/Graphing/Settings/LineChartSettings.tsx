import { TagSwitchGroup } from '@highlight-run/ui/components'
import React from 'react'

import {
	LINE_DISPLAY,
	LINE_NULL_HANDLING,
	LineDisplay,
	LineNullHandling,
} from '../components/LineChart'
import { LabeledRow } from '../LabeledRow'
import * as style from './styles.css'

type Props = {
	nullHandling: LineNullHandling
	setNullHandling: (option: LineNullHandling) => void
	lineDisplay: LineDisplay
	setLineDisplay: (option: LineDisplay) => void
}

export const LineChartSettings: React.FC<Props> = ({
	nullHandling,
	setNullHandling,
	lineDisplay,
	setLineDisplay,
}) => (
	<>
		<LabeledRow
			label="Line display"
			name="lineDisplay"
			tooltip="Lines in charts with multiple series can be stacked."
		>
			<TagSwitchGroup
				options={LINE_DISPLAY}
				defaultValue={lineDisplay}
				onChange={(o: string | number) => {
					setLineDisplay(o as LineDisplay)
				}}
				cssClass={style.tagSwitch}
			/>
		</LabeledRow>
		<LabeledRow
			label="Nulls"
			name="lineNullHandling"
			tooltip="Determines how null / empty values are handled."
		>
			<TagSwitchGroup
				options={LINE_NULL_HANDLING}
				defaultValue={nullHandling}
				onChange={(o: string | number) => {
					setNullHandling(o as LineNullHandling)
				}}
				cssClass={style.tagSwitch}
			/>
		</LabeledRow>
	</>
)

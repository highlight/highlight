import { TagSwitchGroup } from '@highlight-run/ui/components'
import React from 'react'
import Switch from '@/components/Switch/Switch'

import {
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
	disabled?: boolean
}

export const LineChartSettings: React.FC<Props> = ({
	nullHandling,
	setNullHandling,
	lineDisplay,
	setLineDisplay,
	disabled,
}) => (
	<>
		<Switch
			trackingId="switch-lineDisplay"
			label="Stack area"
			checked={lineDisplay === 'Stacked area'}
			onChange={(checked) => {
				setLineDisplay(checked ? 'Stacked area' : 'Line')
			}}
			className={style.tagSwitch}
			disabled={disabled}
		/>
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
				disabled={disabled}
			/>
		</LabeledRow>
	</>
)

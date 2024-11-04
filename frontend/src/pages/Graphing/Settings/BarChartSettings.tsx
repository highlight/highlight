import { TagSwitchGroup } from '@highlight-run/ui/components'
import React from 'react'

import { BAR_DISPLAY, BarDisplay } from '../components/BarChart'
import { LabeledRow } from '../LabeledRow'
import * as style from './styles.css'

type Props = {
	barDisplay: BarDisplay
	setBarDisplay: (option: BarDisplay) => void
	disabled?: boolean
}

export const BarChartSettings: React.FC<Props> = ({
	barDisplay,
	setBarDisplay,
	disabled,
}) => (
	<>
		<LabeledRow
			label="Bar display"
			name="barDisplay"
			tooltip="Bars in charts with multiple series can be stacked or displayed next to each other."
		>
			<TagSwitchGroup
				options={BAR_DISPLAY}
				defaultValue={barDisplay}
				onChange={(o: string | number) => {
					setBarDisplay(o as BarDisplay)
				}}
				cssClass={style.tagSwitch}
				disabled={disabled}
			/>
		</LabeledRow>
	</>
)

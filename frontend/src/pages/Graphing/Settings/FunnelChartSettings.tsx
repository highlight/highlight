import React from 'react'
import { FUNNEL_DISPLAY, FunnelDisplay } from '@pages/Graphing/components/types'
import { LabeledRow } from '@pages/Graphing/LabeledRow'
import { TagSwitchGroup } from '@highlight-run/ui/components'
import * as style from './styles.css'

type Props = {
	funnelDisplay: FunnelDisplay
	setFunnelDisplay: (option: FunnelDisplay) => void
	disabled?: boolean
}

export const FunnelChartSettings: React.FC<Props> = ({
	funnelDisplay,
	setFunnelDisplay,
	disabled,
}) => (
	<>
		<LabeledRow
			label="Funnel display"
			name="funnelDisplay"
			tooltip="Funnel charts display how a single series is broken down into multiple steps."
		>
			<TagSwitchGroup
				options={FUNNEL_DISPLAY}
				defaultValue={funnelDisplay}
				onChange={(o: string | number) => {
					setFunnelDisplay(o as FunnelDisplay)
				}}
				cssClass={style.tagSwitch}
				disabled={disabled}
			/>
		</LabeledRow>
	</>
)

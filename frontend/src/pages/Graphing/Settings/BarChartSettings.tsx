import React from 'react'
import Switch from '@/components/Switch/Switch'

import { BarDisplay } from '../components/BarChart'
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
	<Switch
		trackingId="switch-barDisplay"
		label="Stack bars"
		checked={barDisplay === 'Stacked'}
		onChange={(checked) => {
			setBarDisplay(checked ? 'Stacked' : 'Grouped')
		}}
		className={style.tagSwitch}
		disabled={disabled}
	/>
)

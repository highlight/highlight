import { BarDisplay } from '@/pages/Graphing/components/BarChart'
import { View } from '@/pages/Graphing/components/Graph'
import {
	LineDisplay,
	LineNullHandling,
} from '@/pages/Graphing/components/LineChart'
import { TableNullHandling } from '@/pages/Graphing/components/Table'
import { FunnelDisplay } from '@/pages/Graphing/components/types'
import { GraphSettings } from '@/pages/Graphing/constants'
import {
	BarChartSettings,
	FunnelChartSettings,
	LineChartSettings,
	TableSettings,
} from '@/pages/Graphing/Settings'
import React from 'react'

type Props = {
	viewType: View
	settings: GraphSettings
	disabled: boolean
	setLineNullHandling: (option: LineNullHandling) => void
	setLineDisplay: (option: LineDisplay) => void
	setBarDisplay: (option: BarDisplay) => void
	setFunnelDisplay: (option: FunnelDisplay) => void
	setTableNullHandling: (option: TableNullHandling) => void
}

export const ViewTypeSettings: React.FC<Props> = ({
	viewType,
	settings,
	disabled,
	setLineNullHandling,
	setLineDisplay,
	setBarDisplay,
	setFunnelDisplay,
	setTableNullHandling,
}) => {
	if (viewType === 'Line chart') {
		return (
			<LineChartSettings
				nullHandling={settings.lineNullHandling}
				setNullHandling={setLineNullHandling}
				lineDisplay={settings.lineDisplay}
				setLineDisplay={setLineDisplay}
				disabled={disabled}
			/>
		)
	}

	if (viewType === 'Bar chart') {
		return (
			<BarChartSettings
				barDisplay={settings.barDisplay}
				setBarDisplay={setBarDisplay}
				disabled={disabled}
			/>
		)
	}

	if (viewType === 'Funnel chart') {
		return (
			<FunnelChartSettings
				funnelDisplay={settings.funnelDisplay}
				setFunnelDisplay={setFunnelDisplay}
				disabled={disabled}
			/>
		)
	}
	if (viewType === 'Table') {
		return (
			<TableSettings
				nullHandling={settings.tableNullHandling}
				setNullHandling={setTableNullHandling}
				disabled={disabled}
			/>
		)
	}
}

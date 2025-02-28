import {
	DateRangePicker,
	DateRangePreset,
	DateRangeValue,
	IconSolidClock,
	IconSolidRefresh,
	IconSolidTemplate,
	Stack,
} from '@highlight-run/ui/components'
import * as React from 'react'
import { Button } from '@components/Button'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { GraphMenu } from '@/pages/Graphing/components/GraphMenu'

type Props = {
	handleRefresh: () => void
	dateRangeValue: DateRangeValue
	updateSearchTime: (
		startDate: Date,
		endDate: Date,
		preset?: DateRangePreset,
	) => void

	handleShowTemplates?: () => void
	onDownload?: () => void
	onCreateAlert?: () => void
	onClone?: () => void
	onDelete?: () => void
}

export const ActionBar: React.FC<Props> = ({
	handleRefresh,
	dateRangeValue,
	updateSearchTime,
	onDownload,
	handleShowTemplates,
	onCreateAlert,
	onClone,
	onDelete,
}) => {
	const { presets, minDate } = useRetentionPresets()

	return (
		<Stack
			paddingLeft="12"
			paddingRight="8"
			py="6"
			gap="8"
			borderBottom="dividerWeak"
			direction="row"
			// TODO(spenny): don't show on view page
			justifyContent={handleShowTemplates ? 'space-between' : 'flex-end'}
			alignItems="center"
			style={{ height: 40 }}
		>
			{handleShowTemplates && (
				<Button
					trackingId="view-templates"
					emphasis="high"
					kind="secondary"
					size="xSmall"
					onClick={handleShowTemplates}
					iconLeft={<IconSolidTemplate />}
				>
					View templates
				</Button>
			)}
			<Stack direction="row" gap="4">
				<DateRangePicker
					iconLeft={<IconSolidClock size={14} />}
					emphasis="medium"
					kind="secondary"
					size="xSmall"
					selectedValue={dateRangeValue}
					onDatesChange={updateSearchTime}
					presets={presets}
					minDate={minDate}
				/>
				<Button
					trackingId="refresh-graph"
					emphasis="medium"
					kind="secondary"
					size="xSmall"
					iconLeft={<IconSolidRefresh />}
					onClick={handleRefresh}
				/>
				<GraphMenu
					emphasis="medium"
					onDownload={onDownload}
					onCreateAlert={onCreateAlert}
					onClone={onClone}
					onDelete={onDelete}
				/>
			</Stack>
		</Stack>
	)
}

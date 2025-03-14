import {
	Badge,
	IconSolidCubeTransparent,
	Table,
	Text,
} from '@highlight-run/ui/components'
import moment from 'moment'

export const gridColumns = ['3fr', '1fr', '1fr', '1fr', '1fr']

export type ColumnRendererProps = {
	row: any
	getValue: () => any
	first?: boolean
}

const EmptyState: React.FC = () => (
	<Text color="secondaryContentOnDisabled">empty</Text>
)

export const MetricNameRenderer: React.FC<ColumnRendererProps> = ({
	getValue,
}) => {
	const value = getValue()

	return (
		<Table.Cell>
			{value ? <Text lines="1">{value}</Text> : <EmptyState />}
		</Table.Cell>
	)
}

export const DateTimeRenderer: React.FC<ColumnRendererProps> = ({
	getValue,
}) => {
	const date = getValue()
	const formattedDate = date ? moment(date).format('M/D/YY h:mm:ss A') : null

	return (
		<Table.Cell>
			{formattedDate ? (
				<Text lines="1">{formattedDate}</Text>
			) : (
				<EmptyState />
			)}
		</Table.Cell>
	)
}

export const DataPointsRenderer: React.FC<ColumnRendererProps> = ({
	getValue,
}) => {
	const value = getValue()

	return (
		<Table.Cell>
			{value !== undefined ? (
				<Text lines="1">{value.toLocaleString()}</Text>
			) : (
				<EmptyState />
			)}
		</Table.Cell>
	)
}

export const MetricTypeRenderer: React.FC<ColumnRendererProps> = ({
	getValue,
}) => {
	const value = getValue()

	return (
		<Table.Cell>
			{value ? (
				<Badge
					shape="basic"
					variant="outlineGray"
					size="small"
					label={value}
				/>
			) : (
				<EmptyState />
			)}
		</Table.Cell>
	)
}

export const ServiceNameRenderer: React.FC<ColumnRendererProps> = ({
	getValue,
}) => {
	const value = getValue()

	return (
		<Table.Cell>
			{value ? (
				<Badge
					shape="basic"
					variant="outlineGray"
					size="small"
					iconStart={
						<IconSolidCubeTransparent
							size="12"
							style={{ marginRight: '2px' }}
						/>
					}
					label={value}
				/>
			) : (
				<EmptyState />
			)}
		</Table.Cell>
	)
}

export const ColumnRenderers = {
	metricName: MetricNameRenderer,
	lastConfigured: DateTimeRenderer,
	dataPoints: DataPointsRenderer,
	metricType: MetricTypeRenderer,
	serviceName: ServiceNameRenderer,
}

import { ApolloError } from '@apollo/client'
import moment from 'moment'

import LoadingBox from '@components/LoadingBox'
import {
	Box,
	Callout,
	Stack,
	Table,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import React, { useMemo } from 'react'
import { Button } from '@components/Button'
import { Link } from '@components/Link'
import { Alert, AlertStateChange, ProductType } from '@/graph/generated/schemas'
import { DEFAULT_WINDOW } from '@/pages/Alerts/AlertForm'
import {
	RelatedResource,
	useRelatedResource,
} from '@/components/RelatedResources/hooks'

type Props = {
	alertingStates?: AlertStateChange[]
	alert: Alert
	loading: boolean
	error: ApolloError | undefined
	refetch: () => void
}

export const AlertTable: React.FC<Props> = (props) => {
	return (
		<Box>
			<Box py="12">
				<Text weight="bold" color="strong">
					Alert history
				</Text>
			</Box>
			<AlertTableInner {...props} />
		</Box>
	)
}

const AlertTableInner: React.FC<Props> = ({
	alertingStates = [],
	alert,
	loading,
	error,
	refetch,
}) => {
	const { set } = useRelatedResource()

	const columns = useMemo(
		() => [
			{
				id: 'timestamp',
				name: 'Time',
				width: '200px',
				renderData: (alertState: AlertStateChange) => (
					<Text>
						{moment(alertState.timestamp).format('M/D/YY h:mm A')}
					</Text>
				),
			},
			{
				id: 'groupByKey',
				name: alert.group_by_key || 'Group by',
				width: '1fr',
				renderData: (alertState: AlertStateChange) => (
					<Tag shape="basic" size="small" kind="secondary">
						{alertState.groupByKey || 'N/A'}
					</Tag>
				),
			},
			{
				id: 'view',
				name: '',
				width: '150px',
				renderData: (alertState: AlertStateChange) => {
					const relatedResource = buildRelatedResource(
						alertState,
						alert,
					)
					return (
						<Button
							trackingId={`alertsView${alert.product_type}`}
							size="xSmall"
							kind="secondary"
							emphasis="medium"
							disabled={!relatedResource}
							onClick={() => set(relatedResource!)}
						>
							View {alert.product_type}
						</Button>
					)
				},
			},
		],
		[alert, set],
	)
	const gridColumns = columns.map((column) => column.width)

	const tableBody = useMemo(() => {
		if (loading) {
			return <LoadingBox />
		}

		if (error) {
			return (
				<Box m="auto" style={{ maxWidth: 300 }}>
					<Callout title="Failed to load alerts" kind="error">
						<Box mb="6">
							<Text color="moderate">
								There was an error loading your alerts. Reach
								out to us if this might be a bug.
							</Text>
						</Box>
						<Stack direction="row">
							<Button
								kind="secondary"
								trackingId="alerts-error-reload"
								onClick={() => refetch()}
							>
								Reload alerts
							</Button>
							<Box
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<Link
									to="https://highlight.io/community"
									target="_blank"
								>
									Help
								</Link>
							</Box>
						</Stack>
					</Callout>
				</Box>
			)
		}

		if (!alertingStates?.length) {
			return (
				<Box m="auto" style={{ maxWidth: '300px' }}>
					<Callout title="No alert notifications found" />
				</Box>
			)
		}

		return (
			<>
				{alertingStates.map((alertingState, index) => {
					return (
						<Table.Row gridColumns={gridColumns} key={index}>
							{columns.map((column) => (
								<Table.Cell key={column.id}>
									{column.renderData(alertingState)}
								</Table.Cell>
							))}
						</Table.Row>
					)
				})}
			</>
		)
	}, [alertingStates, columns, error, gridColumns, loading, refetch])

	return (
		<Table noBorder>
			<Table.Head>
				<Table.Row gridColumns={gridColumns}>
					{columns.map((header) => (
						<Table.Header key={header.id}>
							<Box
								display="flex"
								alignItems="center"
								justifyContent="space-between"
							>
								<Stack direction="row" gap="6" align="center">
									<Text lines="1">{header.name}</Text>
								</Stack>
							</Box>
						</Table.Header>
					))}
				</Table.Row>
			</Table.Head>
			<Table.Body
				style={{ minHeight: 400 }}
				display="flex"
				flexDirection="column"
			>
				{tableBody}
			</Table.Body>
		</Table>
	)
}

const buildRelatedResource = (
	alertState: AlertStateChange,
	alert: Alert,
): RelatedResource | null => {
	switch (alert.product_type as ProductType) {
		case ProductType.Sessions:
			return {
				type: 'session',
				secureId: alertState.groupByKey,
			} as RelatedResource
		case ProductType.Errors:
			return {
				type: 'error',
				secureId: alertState.groupByKey,
			} as RelatedResource
		case ProductType.Logs:
			const logParams = buildParams(alertState, alert)
			return {
				type: 'logs',
				...logParams,
			} as RelatedResource
		case ProductType.Traces:
			const traceParams = buildParams(alertState, alert)
			return {
				type: 'traces',
				...traceParams,
			} as RelatedResource
		case ProductType.Events:
			return null // disabled
		case ProductType.Metrics:
			return null // not used
	}
}

const buildParams = (alertState: AlertStateChange, alert: Alert) => {
	const alertTime = moment(alertState.timestamp)
	const lookbackSeconds = alert.threshold_window ?? DEFAULT_WINDOW
	const lookBackStart = moment(alertTime).subtract(lookbackSeconds, 'seconds')

	const params: string[] = []
	if (!!alertState.groupByKey) {
		params.push(`${alert.group_by_key}=${alertState.groupByKey}`)
	}
	if (!!alert.query) {
		params.push(alert.query)
	}

	return {
		startDate: lookBackStart.toISOString(),
		endDate: alertTime.toISOString(),
		query: params.join(' AND '),
	}
}

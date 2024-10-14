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
import { LinkButton } from '@/components/LinkButton'
import { Button } from '@components/Button'
import { Link } from '@components/Link'

type Props = {
	alertingStates?: any[]
	alert: any
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
	const columns = useMemo(
		() => [
			{
				id: 'timestamp',
				name: 'Time',
				width: '200px',
				renderData: (alertState: any) => (
					<Text>{moment(alertState.timestamp).format('LT')}</Text>
				),
			},
			{
				id: 'groupByKey',
				name: alert.group_by_key || 'Group by',
				width: '1fr',
				renderData: (alertState: any) => (
					<Tag shape="basic" size="small" kind="secondary">
						{alertState.groupByKey}
					</Tag>
				),
			},
			{
				id: 'view',
				name: '',
				width: '100px',
				renderData: (_: any) => (
					<LinkButton
						trackingId={`alertsView${alert.product_type}`}
						size="xSmall"
						kind="secondary"
						emphasis="medium"
						// TODO(spenny): build link
						to="/errors"
					>
						View {alert.product_type}
					</LinkButton>
				),
			},
		],
		[alert.group_by_key, alert.product_type],
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
									{column.renderData(alertingState as any)}
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

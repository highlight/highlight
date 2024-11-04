import {
	Box,
	IconSolidPlayCircle,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import moment from 'moment'
import React from 'react'
import { createSearchParams } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { Link } from '@/components/Link'
import { ErrorObjectNode } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'

import * as styles from './ErrorInstancesTable.css'

const toYearMonthDay = (timestamp: string) => {
	const date = new Date(timestamp)
	return moment(date).format('YYYY-MM-DD HH:mm:ss')
}

type Props = {
	nodes: ErrorObjectNode[]
	errorGroupSecureId: string | undefined
}

function truncateVersion(version: string) {
	const maxLength = 6
	if (version.length > maxLength) {
		return version.slice(0, maxLength) + '...'
	} else {
		return version
	}
}

export const ErrorInstancesTable = ({ nodes, errorGroupSecureId }: Props) => {
	const { projectId } = useProjectId()
	const { isLoggedIn } = useAuthContext()
	const columnHelper = createColumnHelper<ErrorObjectNode>()

	const columns = [
		columnHelper.accessor('event', {
			cell: ({ getValue }) => (
				<Box display="flex" flexGrow={1} flexBasis={1}>
					<Text lines="1">{getValue()}</Text>
				</Box>
			),
		}),
		columnHelper.accessor('timestamp', {
			cell: ({ getValue }) => (
				<Tag shape="basic" kind="secondary">
					{toYearMonthDay(getValue())}
				</Tag>
			),
		}),
		columnHelper.accessor('serviceName', {
			cell: ({ getValue }) => {
				const serviceVersion = getValue()
				if (!serviceVersion) {
					return null
				}

				return (
					<Tag shape="basic" kind="secondary">
						{serviceVersion}
					</Tag>
				)
			},
		}),
		columnHelper.accessor('serviceVersion', {
			cell: ({ getValue }) => {
				const serviceVersion = getValue()
				if (!serviceVersion) {
					return null
				}

				return (
					<Tag shape="basic" kind="secondary">
						{truncateVersion(serviceVersion)}
					</Tag>
				)
			},
		}),
		columnHelper.accessor('id', {
			cell: ({ row }) => {
				const errorObjectId = row.original.id
				const timestamp = row.original.timestamp
				const session = row.original.session

				let content = <>no session</>
				let sessionLink = ''

				if (session && !session.excluded) {
					if (session.email) {
						content = <>{session.email}</>
					} else {
						content = session.fingerprint ? (
							<>{session.fingerprint.toString()}</>
						) : (
							<>(no value)</>
						)
					}
					const params = createSearchParams({
						tsAbs: timestamp,
						[PlayerSearchParameters.errorId]: errorObjectId,
					})

					sessionLink = `/${projectId}/sessions/${session.secureID}?${params}`
				}

				return (
					<Link to={sessionLink}>
						<Tag
							kind="secondary"
							emphasis="low"
							size="medium"
							shape="basic"
							disabled={!isLoggedIn || sessionLink === ''}
							iconLeft={<IconSolidPlayCircle />}
						>
							{content}
						</Tag>
					</Link>
				)
			},
		}),
	]

	const table = useReactTable({
		columns,
		data: nodes,
		getCoreRowModel: getCoreRowModel(),
	})

	return (
		<Box width="full">
			{table.getRowModel().rows.map((row) => {
				return (
					<Link
						key={row.id}
						to={{
							pathname: `/${projectId}/errors/${errorGroupSecureId}/instances/${row.original.id}`,
							search: location.search,
						}}
						className={styles.rowLink}
					>
						<Stack
							direction="row"
							gap="4"
							px="12"
							py="6"
							alignItems="center"
						>
							{row.getVisibleCells().map((cell) => {
								return (
									<React.Fragment key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</React.Fragment>
								)
							})}
						</Stack>
					</Link>
				)
			})}
		</Box>
	)
}

import {
	Badge,
	Box,
	IconSolidPlayCircle,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui'
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
import { ErrorObjectEdge } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'

const toYearMonthDay = (timestamp: string) => {
	const date = new Date(timestamp)
	return moment(date).format('YYYY-MM-DD HH:mm:ss')
}

type Props = {
	edges: ErrorObjectEdge[]
}

function truncateVersion(version: string) {
	const maxLength = 6
	if (version.length > maxLength) {
		return version.slice(0, maxLength) + '...'
	} else {
		return version
	}
}

export const ErrorInstancesTable = ({ edges }: Props) => {
	const { projectId } = useProjectId()
	const { isLoggedIn } = useAuthContext()
	const columnHelper = createColumnHelper<ErrorObjectEdge>()

	const columns = [
		columnHelper.accessor('node.event', {
			cell: ({ getValue }) => (
				<Box display="flex" flexGrow={1} flexBasis={1}>
					<Text lines="1">{getValue()}</Text>
				</Box>
			),
		}),
		columnHelper.accessor('node.createdAt', {
			cell: ({ getValue }) => (
				<Tag shape="basic" kind="secondary">
					{toYearMonthDay(getValue())}
				</Tag>
			),
		}),
		columnHelper.accessor('node.session', {
			cell: ({ getValue }) => {
				const session = getValue()
				if (!session?.appVersion) {
					return null
				}

				return (
					<Badge
						size="medium"
						color="weak"
						label={truncateVersion(session.appVersion)}
					></Badge>
				)
			},
		}),
		columnHelper.accessor('node', {
			cell: ({ getValue }) => {
				const errorObjectId = getValue().id
				const timestamp = getValue().timestamp
				const session = getValue().session

				let content = 'no session'
				let sessionLink = ''

				if (session) {
					content = session.email ? session.email : '(no value)'
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
		data: edges,
		getCoreRowModel: getCoreRowModel(),
	})

	return (
		<>
			{table.getRowModel().rows.map((row) => {
				return (
					<Link
						to={`/${projectId}/errors/${row.original.node.errorGroupSecureID}/instances/${row.original.cursor}`}
						key={row.id}
					>
						<Stack
							key={row.id}
							direction="row"
							mb="8"
							px="8"
							py="2"
							alignItems="center"
							cursor="pointer"
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
		</>
	)
}

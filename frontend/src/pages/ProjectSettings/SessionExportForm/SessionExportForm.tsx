import BorderBox from '@components/BorderBox/BorderBox'
import BoxLabel from '@components/BoxLabel/BoxLabel'
import { IconAnimatedLoading, LoadingBar } from '@components/Loading/Loading'
import { useGetSessionExportsQuery } from '@graph/hooks'
import {
	Badge,
	Box,
	Heading,
	IconSolidDownload,
	IconSolidExternalLink,
	Stack,
	Table,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import moment from 'moment/moment'
import React from 'react'
import { useLocation } from 'react-router-dom'

enum ExportStatus {
	Success = 'Success',
	Failure = 'Failure',
	InProgress = 'In Progress',
}

export const SessionExportForm = () => {
	const location = useLocation()
	const { projectId } = useProjectId()
	const ref = React.useRef<HTMLDivElement>()
	const { data, loading } = useGetSessionExportsQuery({
		variables: {
			project_id: projectId,
		},
		skip: !projectId,
	})

	React.useEffect(() => {
		if (ref.current && location.hash === '#exports') {
			ref.current.scrollIntoView()
		}
	}, [location.hash])

	if (loading) {
		return <LoadingBar />
	}

	const gridColumns = ['120px', '120px', '1fr', '124px']
	return (
		<Box ref={ref}>
		<Box ref={ref} background="white" border="dividerWeak" borderRadius="8" p="24">
			<Stack gap="16">
				<Stack gap="4">
					<Heading level="h4">Session Export Requests</Heading>
					<Text color="moderate">Requests to download sessions.</Text>
				</Stack>
				<Table noBorder>
					<Table.Head>
						<Table.Row gridColumns={gridColumns}>
							<Table.Header>Status</Table.Header>
							<Table.Header>Session length</Table.Header>
							<Table.Header>Request time</Table.Header>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{data?.session_exports?.map((se) => {
							const status = se.error
								? ExportStatus.Failure
								: se.url
								? ExportStatus.Success
								: ExportStatus.InProgress
							return (
								<Table.Row
									key={se.secure_id}
									gridColumns={gridColumns}
								>
									<Table.Cell>
										<Badge
											iconStart={
												status ===
												ExportStatus.InProgress ? (
													<IconAnimatedLoading
														size={14}
													/>
												) : undefined
											}
											variant={
												status === ExportStatus.Success
													? 'green'
													: status ===
													  ExportStatus.Failure
													? 'red'
													: 'gray'
											}
											label={status}
										/>
									</Table.Cell>
									<Table.Cell>
										<Text>
											{moment
												.duration(
													se.active_length,
													'millisecond',
												)
												.humanize()}
										</Text>
									</Table.Cell>
									<Table.Cell>
										<Text>
											{moment(se.created_at).format(
												'lll',
											)}
										</Text>
									</Table.Cell>
									<Table.Cell justifyContent="center">
										<Box display="flex" gap="4">
											<Tag
												shape="basic"
												emphasis="medium"
												kind="secondary"
												iconLeft={<IconSolidDownload />}
												disabled={!se.url}
												onClick={() =>
													window.open(se.url, '_blank')
												}
											>
												Download
											</Tag>
											<Tag
												shape="basic"
												emphasis="medium"
												kind="secondary"
												iconLeft={
													<IconSolidExternalLink />
												}
												onClick={() =>
													window.open(
														`/${projectId}/sessions/${se.secure_id}`,
														'_blank',
													)
												}
											/>
										</Box>
									</Table.Cell>
								</Table.Row>
							)
						})}
					</Table.Body>
				</Table>
			</Stack>
		</Box>

		</Box>
	)
}

import BorderBox from '@components/BorderBox/BorderBox'
import BoxLabel from '@components/BoxLabel/BoxLabel'
import { LoadingBar } from '@components/Loading/Loading'
import { useGetSessionExportsQuery } from '@graph/hooks'
import {
	Badge,
	Box,
	IconSolidDownload,
	IconSolidExternalLink,
	IconSolidLoading,
	Stack,
	Table,
	Tag,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { motion } from 'framer-motion'
import moment from 'moment/moment'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export const SessionExportForm = () => {
	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const { data, loading } = useGetSessionExportsQuery({
		variables: {
			project_id: projectId,
		},
		skip: !projectId,
	})
	if (loading) {
		return <LoadingBar />
	}

	const gridColumns = ['120px', '120px', '1fr', '124px']
	return (
		<BorderBox noPadding>
			<Stack gap="8">
				<Box paddingTop="12" px="8">
					<BoxLabel
						label="Session Export Requests"
						info="Requests to download sessions."
					/>
				</Box>
				<Table noBorder>
					<Table.Head>
						<Table.Row gridColumns={gridColumns}>
							<Table.Header>Status</Table.Header>
							<Table.Header>Session length</Table.Header>
							<Table.Header>Request time</Table.Header>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{data?.session_exports?.map((se) => (
							<Table.Row
								key={se.secure_id}
								gridColumns={gridColumns}
							>
								<Table.Cell>
									<Badge
										iconStart={
											!se.url ? (
												<motion.div
													animate={{ rotate: 360 }}
													transition={{
														duration: 1,
														repeat: Infinity,
														ease: 'linear',
													}}
													style={{
														width: 14,
														height: 14,
													}}
												>
													<IconSolidLoading
														size={14}
													/>
												</motion.div>
											) : undefined
										}
										variant={
											se.url
												? 'green'
												: se.error
												? 'red'
												: 'gray'
										}
										label={
											se.url
												? 'Success'
												: se.error
												? 'Failure'
												: 'In Progress'
										}
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
										{moment(se.created_at).format('lll')}
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
											iconLeft={<IconSolidExternalLink />}
											onClick={() =>
												navigate(
													`/${projectId}/sessions/${se.secure_id}`,
												)
											}
										/>
									</Box>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table>
			</Stack>
		</BorderBox>
	)
}

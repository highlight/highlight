import BorderBox from '@components/BorderBox/BorderBox'
import BoxLabel from '@components/BoxLabel/BoxLabel'
import { LoadingBar } from '@components/Loading/Loading'
import { useGetSessionExportsQuery } from '@graph/hooks'
import { Badge, Box, Stack, Text, TextLink } from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'

export const SessionExportForm = () => {
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

	return (
		<BorderBox>
			<Stack gap="8">
				<BoxLabel
					label="Session Export Requests"
					info="Requests to download sessions."
				/>
				<Box>
					{data?.session_exports?.map((se) => (
						<Box
							key={se.secure_id}
							display="flex"
							alignItems="center"
							gap="4"
						>
							<Badge
								variant={
									se.url ? 'green' : se.error ? 'red' : 'gray'
								}
								label={
									se.url
										? 'Success'
										: se.error
										? 'Failure'
										: 'In Progress'
								}
							/>
							<Text>{se.secure_id}</Text>
							{se.url ? (
								<TextLink color="none" href={se.url}>
									Download here
								</TextLink>
							) : null}
						</Box>
					))}
				</Box>
			</Stack>
		</BorderBox>
	)
}

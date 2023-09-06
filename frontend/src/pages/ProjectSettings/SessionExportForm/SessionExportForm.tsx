import BorderBox from '@components/BorderBox/BorderBox'
import BoxLabel from '@components/BoxLabel/BoxLabel'
import { LoadingBar } from '@components/Loading/Loading'
import { useGetSessionExportsQuery } from '@graph/hooks'
import { Box, Stack, Text } from '@highlight-run/ui'

export const SessionExportForm = () => {
	const { data, loading } = useGetSessionExportsQuery()
	if (loading) {
		return <LoadingBar />
	}

	// TODO(vkorolik)
	return (
		<BorderBox>
			<Stack gap="8">
				<BoxLabel
					label="Session Export Requests"
					info="Requests to download sessions."
				/>
				<Box>
					{data?.session_exports?.map((se) => (
						<Box key={se.session_id}>
							<Text>
								{se.session_id}: {se.url}
							</Text>
						</Box>
					))}
				</Box>
			</Stack>
		</BorderBox>
	)
}

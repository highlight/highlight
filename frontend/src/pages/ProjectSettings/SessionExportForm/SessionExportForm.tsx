import BorderBox from '@components/BorderBox/BorderBox'
import BoxLabel from '@components/BoxLabel/BoxLabel'
import { LoadingBar } from '@components/Loading/Loading'
import { useGetSessionExportsQuery } from '@graph/hooks'
import { Box, Stack, TextLink } from '@highlight-run/ui'

export const SessionExportForm = () => {
	const { data, loading } = useGetSessionExportsQuery()
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
						<Box key={se.session_id}>
							<TextLink color="none" href={se.url}>
								{/*TODO(vkorolik) show status of export*/}
								{se.session_id}
							</TextLink>
						</Box>
					))}
				</Box>
			</Stack>
		</BorderBox>
	)
}

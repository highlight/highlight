import { Link } from '@components/Link'
import { Box, IconSolidFilter, Stack, Text } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'

export const SessionFiltersCallout = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	return (
		<Box
			display="flex"
			py="12"
			px="8"
			border="dividerWeak"
			borderRadius="8"
			alignItems="center"
		>
			<Stack>
				<Text weight="bold" size="small" color="strong">
					Filter sessions
				</Text>
				<Text color="moderate">
					Discard sessions that aren't useful based on a query.
					Sessions matching the query will be excluded from your
					searches and quota.
				</Text>
			</Stack>
			<Link to={`/${project_id}/settings/filters/sessions`}>
				<Box pr="16">
					<IconSolidFilter size={20} />
				</Box>
			</Link>
		</Box>
	)
}

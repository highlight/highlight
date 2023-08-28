import { Container, Heading, Stack } from '@highlight-run/ui'

import { FindSimilarErrors } from '@/pages/ErrorTags/FindSimilarErrors'
import { ManageErrorTags } from '@/pages/ErrorTags/ManageErrorTag'
import { MatchErrorTag } from '@/pages/ErrorTags/MatchErrorTag'

export function ErrorTags() {
	return (
		<Container>
			<Stack py="32" gap="32">
				<Heading>Error Tags</Heading>

				<ManageErrorTags />
				<MatchErrorTag />
				<FindSimilarErrors />
			</Stack>
		</Container>
	)
}

import { Heading, Stack } from '@highlight-run/ui'

import { FindSimilarErrors } from '@/pages/ErrorTags/FindSimilarErrors'
import { MatchErrorTag } from '@/pages/ErrorTags/MatchErrorTag'

export function ErrorTagsSearch() {
	return (
		<Stack py="32" gap="32">
			<Heading>Error Tags Search</Heading>
			<FindSimilarErrors />

			<MatchErrorTag />
		</Stack>
	)
}

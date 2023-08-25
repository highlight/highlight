import { Box, Heading, Stack } from '@highlight-run/ui'

import { ManageErrorTags } from '@/pages/ErrorTags/ManageErrorTag'

export function ErrorTagsAdmin() {
	return (
		<Stack gap="32">
			<Box>
				<Heading>Error Tags Admin</Heading>
			</Box>
			<ManageErrorTags />
		</Stack>
	)
}

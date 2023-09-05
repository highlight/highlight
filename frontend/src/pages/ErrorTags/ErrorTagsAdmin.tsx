import { Box, IconSolidCheveronLeft, Stack } from '@highlight-run/ui'

import { Button } from '@/components/Button'
import { ManageErrorTags } from '@/pages/ErrorTags/ManageErrorTag'

import styles from './ErrorTags.module.css'

export function ErrorTagsAdmin() {
	return (
		<Stack gap="32">
			<Box style={{ display: 'flex', justifyContent: 'space-between' }}>
				<a href="/error-tags">
					<Button
						trackingId="error-tags-admin-go-back"
						iconLeft={<IconSolidCheveronLeft />}
						kind="secondary"
						cssClass={styles.goBackButton}
					>
						To Error Tags
					</Button>
				</a>
			</Box>
			<ManageErrorTags />
		</Stack>
	)
}

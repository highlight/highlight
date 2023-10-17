import { Box, IconSolidCheveronLeft, Stack } from '@highlight-run/ui'
import { Link } from 'react-router-dom'

import { Button } from '@/components/Button'
import { ManageErrorTags } from '@/pages/ErrorTags/ManageErrorTag'

import styles from './ErrorTags.module.css'

export function ErrorTagsAdmin() {
	return (
		<Stack gap="32">
			<Box style={{ display: 'flex', justifyContent: 'space-between' }}>
				<Link to="/error-tags">
					<Button
						trackingId="error-tags-admin-go-back"
						iconLeft={<IconSolidCheveronLeft />}
						kind="secondary"
						cssClass={styles.goBackButton}
					>
						To Error Tags
					</Button>
				</Link>
			</Box>
			<ManageErrorTags />
		</Stack>
	)
}

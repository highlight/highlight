import {
	Badge,
	Box,
	IconSolidBadgeCheck,
	IconSolidLoading,
	Stack,
	Text,
} from '@highlight-run/ui'
import React from 'react'

import * as styles from './IntegrationBar.css'

type Props = React.PropsWithChildren & {
	integrated: boolean
}

export const IntegrationBar: React.FC<Props> = ({ integrated }) => {
	return (
		<Box
			backgroundColor={integrated ? 'good' : 'elevated'}
			p="10"
			display="flex"
			flexDirection="column"
			justifyContent="center"
			alignItems="center"
			style={{ height: 36 }}
		>
			{integrated ? (
				<Stack gap="6" direction="row" align="center">
					<Text color="good">Installation Status</Text>
					<Badge
						label="Done"
						variant="green"
						iconStart={<IconSolidBadgeCheck />}
					/>
				</Stack>
			) : (
				<Stack gap="2" direction="row">
					<Badge
						size="medium"
						label="Installation Status"
						variant="gray"
						cssClass={styles.badgeFirst}
					/>
					<Badge
						size="medium"
						label="Pending"
						variant="gray"
						iconStart={
							<IconSolidLoading className={styles.loading} />
						}
						cssClass={styles.badgeLast}
					/>
				</Stack>
			)}
		</Box>
	)
}

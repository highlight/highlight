import { Button } from '@components/Button'
import { Box, Container, Text } from '@highlight-run/ui'

import * as styles from './styles.css'

export const LogMonitorPage = () => {
	return (
		<Box width="full" background="raised" px="8">
			<Box
				border="dividerWeak"
				borderRadius="6"
				width="full"
				shadow="medium"
				background="default"
				display="flex"
				flexDirection="column"
			>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					borderBottom="dividerWeak"
					px="8"
					py="6"
					cssClass={styles.header}
				>
					<Text userSelect="none">Create monitoring alert</Text>
					<Box display="flex" alignItems="center" gap="4">
						<Button
							kind="secondary"
							size="small"
							emphasis="low"
							trackingId="closeLogMonitoringAlert"
						>
							Cancel
						</Button>
						<Button
							kind="primary"
							size="small"
							emphasis="high"
							trackingId="saveLogMonitoringAlert"
						>
							Create alert
						</Button>
					</Box>
				</Box>
				<Container display="flex" flexDirection="column" py="24">
					<Box display="flex" flexDirection="column">
						Test
					</Box>
				</Container>
			</Box>
		</Box>
	)
}

export default LogMonitorPage

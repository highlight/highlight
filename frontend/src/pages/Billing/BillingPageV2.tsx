import { Box, Heading, IconSolidArrowSmRight, Text } from '@highlight-run/ui'

import { Button } from '@/components/Button'

type UsageCardProps = {
	trackingId: string
	closable?: boolean
	shouldAlwaysShow?: boolean
}

const UsageCard = ({}: {}) => {
	return <Box></Box>
}

type BillingPageProps = {
	trackingId: string
	closable?: boolean
	shouldAlwaysShow?: boolean
}

const BillingPageV2 = ({}: BillingPageProps) => {
	return (
		<Box height="full">
			<Heading level="h4">Billing plans</Heading>
			<Box>
				<Text size="small" weight="medium">
					Prices are usage based and flexibly on your needs.
				</Text>
				<Button
					iconRight={<IconSolidArrowSmRight />}
					// size="large"
					kind="primary"
					emphasis="low"
					trackingId="BillingCustomQuote"
				>
					Custom Quote? Reach out to sales
				</Button>
			</Box>
			<Box>
				<Text size="large" weight="bold">
					Current plan details
				</Text>
				<Button
					trackingId="BillingPaymentSettings"
					size="small"
					emphasis="low"
					kind="secondary"
				>
					Payment Settings
				</Button>
				<Button
					trackingId="BillingUpdatePlanDetails"
					size="small"
					emphasis="high"
					kind="primary"
				>
					Update Plan Details
				</Button>
			</Box>
			<Box></Box>
		</Box>
	)
}

export default BillingPageV2

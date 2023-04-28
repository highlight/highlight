import { Box, Heading, IconSolidArrowSmRight, Text } from '@highlight-run/ui'

import { Button } from '@/components/Button'

const BillingPageV2 = ({}: {}) => {
	return (
		<Box height="full">
			<Heading level="h4">Billing plans</Heading>
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
	)
}

export default BillingPageV2

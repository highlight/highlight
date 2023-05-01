import { USD } from '@dinero.js/currencies'
import { Box, Heading, IconSolidArrowSmRight, Text } from '@highlight-run/ui'
import { dinero, toDecimal } from 'dinero.js'

import { Button } from '@/components/Button'
import { RetentionPeriod } from '@/graph/generated/schemas'
import { RETENTION_PERIOD_LABELS } from '@/pages/Billing/Billing'

import * as style from './BillingPageV2.css'

type UsageCardProps = {
	productType: string
	costCents: number
	retentionPeriod: RetentionPeriod
	billingLimitCents: number | undefined
	usageAmount: number
	usageLimitAmount: number | undefined
}

const UsageCard = ({
	productType,
	costCents,
	retentionPeriod,
}: UsageCardProps) => {
	const amt = dinero({ amount: costCents, currency: USD })
	const formatted = toDecimal(amt)
	return (
		<Box>
			<Box display="flex" justifyContent="space-between">
				<Box>{productType}</Box>
				<Box>${formatted}</Box>
			</Box>
			<Box>{RETENTION_PERIOD_LABELS[retentionPeriod]}</Box>
		</Box>
	)
}

type BillingPageProps = {
	trackingId: string
	closable?: boolean
	shouldAlwaysShow?: boolean
}

const BillingPageV2 = ({}: BillingPageProps) => {
	return (
		<Box width="full" display="flex" justifyContent="center">
			<Box height="full" cssClass={style.pageWrapper}>
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
				<Box display="flex" justifyContent="space-between">
					<Box>
						<Text size="large" weight="bold">
							Current plan details
						</Text>
					</Box>
					<Box>
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
				</Box>
				<Box>
					<UsageCard
						productType="Sessions"
						costCents={12323}
						retentionPeriod={RetentionPeriod.ThreeMonths}
						billingLimitCents={24000}
						usageAmount={8030}
						usageLimitAmount={undefined}
					/>
					<UsageCard
						productType="Errors"
						costCents={39200}
						retentionPeriod={RetentionPeriod.ThreeMonths}
						billingLimitCents={undefined}
						usageAmount={0}
						usageLimitAmount={undefined}
					/>
					<UsageCard
						productType="Logs"
						costCents={10000}
						retentionPeriod={RetentionPeriod.ThreeMonths}
						billingLimitCents={undefined}
						usageAmount={0}
						usageLimitAmount={undefined}
					/>
				</Box>
			</Box>
		</Box>
	)
}

export default BillingPageV2

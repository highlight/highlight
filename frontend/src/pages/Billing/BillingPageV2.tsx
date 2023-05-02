import { USD } from '@dinero.js/currencies'
import {
	Box,
	Heading,
	IconProps,
	IconSolidArrowSmRight,
	IconSolidCheveronRight,
	IconSolidInformationCircle,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	Tag,
	Text,
} from '@highlight-run/ui'
import { dinero, toDecimal } from 'dinero.js'

import { Button } from '@/components/Button'
import { RetentionPeriod } from '@/graph/generated/schemas'
import { RETENTION_PERIOD_LABELS } from '@/pages/Billing/Billing'
import { formatNumberWithDelimiters } from '@/util/numbers'

import * as style from './BillingPageV2.css'

type UsageCardProps = {
	productIcon: React.ReactElement<IconProps>
	productType: string
	costCents: number
	retentionPeriod: RetentionPeriod
	billingLimitCents: number | undefined
	usageAmount: number
	usageLimitAmount: number | undefined
}

const UsageCard = ({
	productIcon,
	productType,
	costCents,
	retentionPeriod,
	billingLimitCents,
	usageAmount,
	usageLimitAmount,
}: UsageCardProps) => {
	const costFormatted =
		'$' + toDecimal(dinero({ amount: costCents, currency: USD }))
	const limitFormatted = billingLimitCents
		? '$' + toDecimal(dinero({ amount: billingLimitCents, currency: USD }))
		: undefined
	const usageRatio = billingLimitCents && costCents / billingLimitCents
	const isOverage = usageRatio ? usageRatio >= 1 : false

	return (
		<Box px="12" display="flex" gap="12" flexDirection="column">
			<Box display="flex" gap="4" flexDirection="column">
				<Box display="flex" justifyContent="space-between">
					<Box display="flex" gap="4">
						{productIcon}
						{productType}
					</Box>
					<Box>{costFormatted}</Box>
				</Box>
				<Box display="flex" gap="4">
					<Tag
						size="medium"
						shape="basic"
						kind="secondary"
						emphasis="medium"
						iconRight={<IconSolidInformationCircle />}
					>
						Retention: {RETENTION_PERIOD_LABELS[retentionPeriod]}
					</Tag>
					<Tag
						size="medium"
						shape="basic"
						kind="secondary"
						emphasis="medium"
						iconRight={<IconSolidInformationCircle />}
					>
						Billing Limit: {limitFormatted ?? 'Unlimited'}
					</Tag>
					<Tag
						iconRight={<IconSolidCheveronRight />}
						kind="secondary"
						emphasis="low"
						shape="basic"
					>
						Update
					</Tag>
				</Box>
			</Box>
			<Box display="flex" flexDirection="column" gap="4">
				<Box cssClass={style.progressBarBackground}>
					<Box
						cssClass={
							isOverage
								? style.progressBarOverage
								: style.progressBar
						}
						height="full"
						style={{ width: `${(usageRatio ?? 0) * 100}%` }}
					/>
				</Box>
				<Text color={isOverage ? 'caution' : undefined}>
					{formatNumberWithDelimiters(usageAmount)} /{' '}
					{formatNumberWithDelimiters(usageLimitAmount) ??
						'Unlimited'}
				</Text>
			</Box>
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
				<Box display="flex">
					<Text size="small" weight="medium">
						Prices are usage based and flexibly on your needs.
					</Text>
					<Tag
						iconRight={<IconSolidArrowSmRight />}
						kind="primary"
						emphasis="low"
						shape="basic"
					>
						Custom Quote? Reach out to sales
					</Tag>
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
				<Box
					display="flex"
					flexDirection="column"
					border="secondary"
					borderRadius="8"
					py="12"
					gap="12"
				>
					<UsageCard
						productIcon={<IconSolidPlayCircle />}
						productType="Sessions"
						costCents={12323}
						retentionPeriod={RetentionPeriod.ThreeMonths}
						billingLimitCents={24000}
						usageAmount={8030}
						usageLimitAmount={16000}
					/>
					<Box borderTop="secondary" />
					<UsageCard
						productIcon={<IconSolidLightningBolt />}
						productType="Errors"
						costCents={39200}
						retentionPeriod={RetentionPeriod.ThreeMonths}
						billingLimitCents={undefined}
						usageAmount={302}
						usageLimitAmount={undefined}
					/>
					<Box borderTop="secondary" />
					<UsageCard
						productIcon={<IconSolidLogs />}
						productType="Logs"
						costCents={10000}
						retentionPeriod={RetentionPeriod.ThreeMonths}
						billingLimitCents={10000}
						usageAmount={17000}
						usageLimitAmount={17000}
					/>
				</Box>
			</Box>
		</Box>
	)
}

export default BillingPageV2

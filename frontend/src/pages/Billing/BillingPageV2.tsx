import { USD } from '@dinero.js/currencies'
import {
	Badge,
	Box,
	Heading,
	IconProps,
	IconSolidArrowSmRight,
	IconSolidCheveronRight,
	IconSolidExclamation,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	Tag,
	Text,
} from '@highlight-run/ui'
import { dinero, toDecimal } from 'dinero.js'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/Button'
import InfoTooltip from '@/components/InfoTooltip/InfoTooltip'
import {
	useGetBillingDetailsQuery,
	useGetCustomerPortalUrlLazyQuery,
} from '@/graph/generated/hooks'
import { ProductType, RetentionPeriod } from '@/graph/generated/schemas'
import { RETENTION_PERIOD_LABELS, tryCastDate } from '@/pages/Billing/Billing'
import {
	getCostCents,
	getNextBillingDate,
	getQuantity,
} from '@/pages/Billing/UpdatePlanPage'
import { formatNumberWithDelimiters } from '@/util/numbers'
import { useParams } from '@/util/react-router/useParams'

import * as style from './BillingPageV2.css'

type UsageCardProps = {
	productIcon: React.ReactElement<IconProps>
	productType: ProductType
	retentionPeriod: RetentionPeriod
	billingLimitCents: number | undefined
	usageAmount: number
}

const UsageCard = ({
	productIcon,
	productType,
	retentionPeriod,
	billingLimitCents,
	usageAmount,
}: UsageCardProps) => {
	const navigate = useNavigate()

	const costCents = getCostCents(productType, retentionPeriod, usageAmount)
	const usageLimitAmount = getQuantity(
		productType,
		retentionPeriod,
		billingLimitCents,
	)

	const costFormatted =
		'$' + toDecimal(dinero({ amount: costCents, currency: USD }))
	const limitFormatted =
		billingLimitCents !== undefined
			? '$' +
			  toDecimal(dinero({ amount: billingLimitCents, currency: USD }))
			: undefined
	const usageRatio = usageLimitAmount && usageAmount / usageLimitAmount
	const isOverage = usageRatio ? usageRatio >= 1 : false

	return (
		<Box px="12" display="flex" gap="12" flexDirection="column">
			<Box display="flex" gap="4" flexDirection="column">
				<Box display="flex" justifyContent="space-between">
					<Box display="flex" gap="4" alignItems="center">
						{productIcon}
						<Text color="n12">{productType}</Text>
					</Box>
					<Text color="n12">{costFormatted}</Text>
				</Box>
				<Box display="flex" gap="4">
					<Badge
						size="medium"
						shape="basic"
						kind="secondary"
						label={`Retention: ${RETENTION_PERIOD_LABELS[retentionPeriod]}`}
						iconEnd={
							<Box
								display="flex"
								alignItems="center"
								style={{ width: 12, height: 12 }}
							>
								<InfoTooltip
									title={`${productType} recorded before this date will not be accessible.`}
								/>
							</Box>
						}
					></Badge>
					<Badge
						size="medium"
						shape="basic"
						kind="secondary"
						label={`Billing Limit: ${
							limitFormatted ?? 'Unlimited'
						}`}
						iconEnd={
							<Box
								display="flex"
								alignItems="center"
								style={{ width: 12, height: 12 }}
							>
								<InfoTooltip
									title={`${productType} will not be recorded once this spending limit is reached.`}
								/>
							</Box>
						}
					></Badge>
					<Tag
						iconRight={<IconSolidCheveronRight />}
						kind="secondary"
						emphasis="low"
						shape="basic"
						onClick={() => {
							navigate('update-plan')
						}}
					>
						Update
					</Tag>
				</Box>
			</Box>
			<Box display="flex" flexDirection="column" gap="4">
				<Box
					color={isOverage ? 'caution' : undefined}
					alignItems="center"
					display="flex"
					gap="4"
				>
					<Text size="xSmall">
						{formatNumberWithDelimiters(usageAmount)} /{' '}
						{formatNumberWithDelimiters(usageLimitAmount) ??
							'Unlimited'}
					</Text>
					{isOverage && <IconSolidExclamation />}
				</Box>
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
			</Box>
		</Box>
	)
}

type BillingPageProps = {}

const BillingPageV2 = ({}: BillingPageProps) => {
	const { workspace_id } = useParams<{
		workspace_id: string
	}>()

	const navigate = useNavigate()

	const { data, loading } = useGetBillingDetailsQuery({
		variables: {
			workspace_id: workspace_id!,
		},
	})

	const [getCustomerPortalUrl, { loading: loadingCustomerPortal }] =
		useGetCustomerPortalUrlLazyQuery({
			variables: {
				workspace_id: workspace_id!,
			},
			onCompleted: (data) => {
				if (data?.customer_portal_url) {
					window.open(data?.customer_portal_url, '_self')
				}
			},
		})

	if (loading) {
		return null
	}

	const nextInvoiceDate = tryCastDate(data?.workspace?.next_invoice_date)
	const billingPeriodEnd = tryCastDate(data?.workspace?.billing_period_end)
	const nextBillingDate = getNextBillingDate(
		nextInvoiceDate,
		billingPeriodEnd,
	)

	const sessionsRetention =
		data?.workspace?.retention_period ?? RetentionPeriod.SixMonths

	const errorsRetention =
		data?.workspace?.errors_retention_period ?? RetentionPeriod.SixMonths

	const logsRetention = RetentionPeriod.ThirtyDays

	const sessionsUsage = data?.billingDetails.meter ?? 0
	const errorsUsage = data?.billingDetails.errorsMeter ?? 0
	const logsUsage = data?.billingDetails.logsMeter ?? 0

	const totalCents =
		getCostCents(ProductType.Sessions, sessionsRetention, sessionsUsage) +
		getCostCents(ProductType.Errors, errorsRetention, errorsUsage) +
		getCostCents(ProductType.Logs, logsRetention, logsUsage)

	const totalFormatted =
		'$' + toDecimal(dinero({ amount: totalCents, currency: USD }))

	return (
		<Box width="full" display="flex" justifyContent="center">
			<Box
				height="full"
				px="8"
				cssClass={style.pageWrapper}
				display="flex"
				flexDirection="column"
				gap="16"
			>
				<Box display="flex" flexDirection="column" gap="16">
					<Heading level="h4">Billing plans</Heading>
					<Box>
						<Text size="small" weight="medium">
							Prices are usage based and flexible with your needs.
							Need a custom quote or want to commit to a minimum
							spend?{' '}
							<a href="mailto:sales@highlight.run">
								Reach out to sales <IconSolidArrowSmRight />
							</a>
						</Text>
					</Box>
				</Box>
				<Box display="flex" justifyContent="space-between">
					<Box display="flex" alignItems="center">
						<Text size="large" weight="bold" color="n12">
							Current plan details
						</Text>
					</Box>
					<Box display="flex" gap="6">
						<Button
							trackingId="BillingPaymentSettings"
							size="small"
							emphasis="low"
							kind="secondary"
							disabled={loadingCustomerPortal}
							onClick={() => {
								getCustomerPortalUrl()
							}}
						>
							Payment Settings
						</Button>
						<Button
							trackingId="BillingUpdatePlanDetails"
							size="small"
							emphasis="high"
							kind="primary"
							onClick={() => {
								navigate('update-plan')
							}}
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
						productType={ProductType.Sessions}
						retentionPeriod={sessionsRetention}
						billingLimitCents={
							data?.workspace?.sessions_max_cents ?? undefined
						}
						usageAmount={sessionsUsage}
					/>
					<Box borderTop="secondary" />
					<UsageCard
						productIcon={<IconSolidLightningBolt />}
						productType={ProductType.Errors}
						retentionPeriod={errorsRetention}
						billingLimitCents={
							data?.workspace?.errors_max_cents ?? undefined
						}
						usageAmount={errorsUsage}
					/>
					<Box borderTop="secondary" />
					<UsageCard
						productIcon={<IconSolidLogs />}
						productType={ProductType.Logs}
						retentionPeriod={logsRetention}
						billingLimitCents={
							data?.workspace?.logs_max_cents ?? undefined
						}
						usageAmount={logsUsage}
					/>
				</Box>
				<Box
					display="flex"
					flexDirection="column"
					border="secondary"
					borderRadius="8"
					p="12"
					gap="12"
				>
					<Box display="flex" justifyContent="space-between">
						<Box display="flex" gap="4">
							<Text color="n12">Total</Text>
							<Text>
								Due {moment(nextBillingDate).format('MM/DD/YY')}
							</Text>
						</Box>
						<Text color="p11" weight="bold">
							{totalFormatted}
						</Text>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

export default BillingPageV2

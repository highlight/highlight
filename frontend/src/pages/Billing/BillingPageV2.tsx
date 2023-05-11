import { USD } from '@dinero.js/currencies'
import {
	Badge,
	Box,
	Heading,
	IconProps,
	IconSolidArrowSmRight,
	IconSolidCheveronRight,
	IconSolidCog,
	IconSolidExclamation,
	IconSolidInformationCircle,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	Stack,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui'
import { message } from 'antd'
import { dinero, toDecimal } from 'dinero.js'
import moment from 'moment'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/Button'
import {
	useGetBillingDetailsQuery,
	useGetCustomerPortalUrlLazyQuery,
	useUpdateBillingDetailsMutation,
} from '@/graph/generated/hooks'
import {
	PlanType,
	ProductType,
	RetentionPeriod,
} from '@/graph/generated/schemas'
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
	isPaying: boolean
}

const UsageCard = ({
	productIcon,
	productType,
	retentionPeriod,
	billingLimitCents,
	usageAmount,
	isPaying,
}: UsageCardProps) => {
	const navigate = useNavigate()

	const costCents = isPaying
		? getCostCents(productType, retentionPeriod, usageAmount)
		: 0
	const usageLimitAmount = getQuantity(
		productType,
		retentionPeriod,
		billingLimitCents,
	)

	const costFormatted =
		'$ ' + toDecimal(dinero({ amount: costCents, currency: USD }))
	const limitFormatted =
		billingLimitCents !== undefined
			? '$ ' +
			  toDecimal(dinero({ amount: billingLimitCents, currency: USD }))
			: undefined
	const usageRatio = usageLimitAmount && usageAmount / usageLimitAmount
	const isOverage = usageRatio ? usageRatio >= 1 : false

	return (
		<Box px="12" display="flex" gap="12" flexDirection="column">
			<Box display="flex" gap="4" flexDirection="column">
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
				>
					<Box
						display="flex"
						gap="4"
						alignItems="center"
						cssClass={style.usageTitle}
						color="weak"
					>
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
							<Tooltip
								trigger={
									<IconSolidInformationCircle size={12} />
								}
							>
								{productType} recorded before this date will not
								be accessible.
							</Tooltip>
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
							<Tooltip
								trigger={
									<IconSolidInformationCircle size={12} />
								}
							>
								{productType} will not be recorded once this
								billing limit is reached.
							</Tooltip>
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
					cssClass={style.progressAmount}
				>
					<Text size="xSmall">
						{formatNumberWithDelimiters(usageAmount)} /{' '}
						{formatNumberWithDelimiters(usageLimitAmount) ??
							'Unlimited'}
					</Text>
					{isOverage && (
						<Tooltip trigger={<IconSolidExclamation />}>
							{productType} have exceeded your monthly billing
							limit and are not being recorded.
						</Tooltip>
					)}
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
	const location = useLocation()

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

	const [updateBillingDetails] = useUpdateBillingDetailsMutation({
		variables: { workspace_id: workspace_id! },
	})

	useEffect(() => {
		const response = location.pathname.split('/')[4] ?? ''
		if (response === 'success') {
			updateBillingDetails().then(() => {
				message.success('Billing plan saved!')
			})
		}
	}, [location.pathname, updateBillingDetails])

	if (loading) {
		return null
	}

	const isPaying = data?.billingDetails.plan.type !== PlanType.Free

	const nextInvoiceDate = tryCastDate(data?.workspace?.next_invoice_date)
	const billingPeriodEnd = tryCastDate(data?.workspace?.billing_period_end)
	const nextBillingDate = getNextBillingDate(
		isPaying,
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

	const totalCents = isPaying
		? getCostCents(ProductType.Sessions, sessionsRetention, sessionsUsage) +
		  getCostCents(ProductType.Errors, errorsRetention, errorsUsage) +
		  getCostCents(ProductType.Logs, logsRetention, logsUsage)
		: 0

	const totalFormatted =
		'$ ' + toDecimal(dinero({ amount: totalCents, currency: USD }))

	const sessionsLimit = isPaying
		? data?.workspace?.sessions_max_cents ?? undefined
		: 0

	const errorsLimit = isPaying
		? data?.workspace?.errors_max_cents ?? undefined
		: 0

	const logsLimit = isPaying
		? data?.workspace?.logs_max_cents ?? undefined
		: 0

	return (
		<Box width="full" display="flex" justifyContent="center">
			<Stack height="full" px="8" cssClass={style.pageWrapper} gap="0">
				<Stack>
					<Heading level="h4">Billing plans</Heading>
					<Box>
						<Text size="small" weight="medium">
							Prices are usage based and flexible with your needs.
							Need a custom quote or want to commit to a minimum
							spend?{' '}
							<a href="mailto:sales@highlight.run">
								<Box display="inline-flex" alignItems="center">
									Reach out to sales <IconSolidArrowSmRight />
								</Box>
							</a>
						</Text>
					</Box>
				</Stack>
				<Box display="flex" justifyContent="space-between" mt="24">
					<Box display="flex" alignItems="center">
						<Text size="large" weight="bold" color="n12">
							Current plan's details
						</Text>
					</Box>
					<Box display="flex" gap="6" color="n11">
						<Button
							trackingId="BillingPaymentSettings"
							size="small"
							emphasis="low"
							kind="secondary"
							disabled={loadingCustomerPortal}
							onClick={() => {
								getCustomerPortalUrl()
							}}
							iconLeft={<IconSolidCog color="n11" />}
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
							{isPaying ? 'Update Plan Details' : 'Upgrade plan'}
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
					mt="8"
				>
					<UsageCard
						productIcon={<IconSolidPlayCircle />}
						productType={ProductType.Sessions}
						retentionPeriod={sessionsRetention}
						billingLimitCents={sessionsLimit}
						usageAmount={sessionsUsage}
						isPaying={isPaying}
					/>
					<Box borderTop="secondary" />
					<UsageCard
						productIcon={<IconSolidLightningBolt />}
						productType={ProductType.Errors}
						retentionPeriod={errorsRetention}
						billingLimitCents={errorsLimit}
						usageAmount={errorsUsage}
						isPaying={isPaying}
					/>
					<Box borderTop="secondary" />
					<UsageCard
						productIcon={<IconSolidLogs />}
						productType={ProductType.Logs}
						retentionPeriod={logsRetention}
						billingLimitCents={logsLimit}
						usageAmount={logsUsage}
						isPaying={isPaying}
					/>
				</Box>
				<Stack
					border="secondary"
					borderRadius="8"
					alignItems="center"
					p="12"
					gap="12"
					mt="16"
				>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
						width="full"
						cssClass={style.totalBox}
						alignItems="center"
					>
						<Box display="flex" gap="4">
							<Text color="n12">Total this month</Text>
							{isPaying && (
								<Text>
									Due{' '}
									{moment(nextBillingDate).format('MM/DD/YY')}
								</Text>
							)}
						</Box>
						<Text color="p11" weight="bold">
							{totalFormatted}
						</Text>
					</Box>
				</Stack>
			</Stack>
		</Box>
	)
}

export default BillingPageV2

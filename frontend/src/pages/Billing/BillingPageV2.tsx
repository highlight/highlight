import { USD } from '@dinero.js/currencies'
import {
	Badge,
	Box,
	Callout,
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
	IconSolidSparkles,
	Stack,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { message } from 'antd'
import { dinero, toDecimal } from 'dinero.js'
import moment from 'moment'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/Button'
import { LoadingRightPanel } from '@/components/Loading/Loading'
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
import {
	getCostCents,
	getNextBillingDate,
	getQuantity,
} from '@/pages/Billing/UpdatePlanPage'
import {
	RETENTION_PERIOD_LABELS,
	tryCastDate,
} from '@/pages/Billing/utils/utils'
import { formatNumberWithDelimiters } from '@/util/numbers'
import { useParams } from '@/util/react-router/useParams'

import * as style from './BillingPageV2.css'

type UsageCardProps = {
	productIcon: React.ReactElement<IconProps>
	productType: ProductType
	rate: number | undefined
	retentionPeriod: RetentionPeriod
	planType: PlanType
	billingLimitCents: number | undefined
	usageAmount: number
	includedQuantity: number
	isPaying: boolean
	enableBillingLimits: boolean | undefined
	billingIssues: boolean
}

const UsageCard = ({
	productIcon,
	productType,
	rate,
	retentionPeriod,
	billingLimitCents,
	usageAmount,
	includedQuantity,
	isPaying,
	enableBillingLimits,
	billingIssues,
}: UsageCardProps) => {
	const { workspace_id } = useParams<{
		workspace_id: string
	}>()

	const navigate = useNavigate()

	const costCents = isPaying
		? getCostCents(
				productType,
				rate,
				retentionPeriod,
				usageAmount,
				includedQuantity,
		  )
		: 0
	const usageLimitAmount = getQuantity(
		productType,
		rate,
		retentionPeriod,
		billingLimitCents,
		includedQuantity,
	)

	const costFormatted =
		'$ ' +
		toDecimal(dinero({ amount: Math.round(costCents), currency: USD }))
	const limitFormatted =
		billingLimitCents !== undefined
			? '$ ' +
			  toDecimal(
					dinero({
						amount: Math.round(billingLimitCents),
						currency: USD,
					}),
			  )
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
					{enableBillingLimits ? (
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
					) : null}
					<Tag
						iconRight={<IconSolidCheveronRight />}
						kind="secondary"
						emphasis="low"
						shape="basic"
						onClick={() => {
							navigate(
								`/w/${workspace_id}/current-plan/update-plan`,
							)
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
					{billingIssues ? (
						<>
							<Text size="xSmall" color="moderate">
								{formatNumberWithDelimiters(usageAmount)} on
								hold
							</Text>
							<IconSolidExclamation
								color={vars.theme.static.content.moderate}
							/>
						</>
					) : (
						<Text size="xSmall" color="moderate">
							{formatNumberWithDelimiters(usageAmount)} /{' '}
							{formatNumberWithDelimiters(usageLimitAmount) ??
								'Unlimited'}
						</Text>
					)}
					{isOverage && (
						<Tooltip trigger={<IconSolidExclamation />}>
							{productType} have exceeded your billing limit and
							are not being recorded.
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

	const { data, loading, refetch } = useGetBillingDetailsQuery({
		variables: {
			workspace_id: workspace_id!,
		},
	})

	const billingIssue = data?.subscription_details.billingIssue ?? false

	const [openCustomerPortalUrl, { loading: loadingCustomerPortal }] =
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
				refetch()
				message.success('Billing plan saved!')
			})
		}
	}, [location.pathname, refetch, updateBillingDetails])

	if (loading) {
		return <LoadingRightPanel show={true} />
	}

	const baseAmount = data?.subscription_details.baseAmount ?? 0
	const discountPercent = data?.subscription_details.discount?.percent ?? 0
	const discountAmount = data?.subscription_details.discount?.amount ?? 0

	const isPaying = data?.billingDetails.plan.type !== PlanType.Free

	const nextInvoiceDate = tryCastDate(data?.workspace?.next_invoice_date)
	const billingPeriodEnd = tryCastDate(data?.workspace?.billing_period_end)
	const nextBillingDate = getNextBillingDate(
		isPaying,
		nextInvoiceDate,
		billingPeriodEnd,
	)

	const sessionsRate = data?.billingDetails.plan.sessionsRate ?? 0
	const errorsRate = data?.billingDetails.plan.errorsRate ?? 0
	const logsRate = data?.billingDetails.plan.logsRate ?? 0
	const tracesRate = data?.billingDetails.plan.tracesRate ?? 0

	const sessionsRetention =
		data?.workspace?.retention_period ?? RetentionPeriod.SixMonths

	const errorsRetention =
		data?.workspace?.errors_retention_period ?? RetentionPeriod.SixMonths

	const logsRetention = RetentionPeriod.ThirtyDays
	const tracesRetention = RetentionPeriod.ThirtyDays

	const sessionsUsage = data?.billingDetails.meter ?? 0
	const errorsUsage = data?.billingDetails.errorsMeter ?? 0
	const logsUsage = data?.billingDetails.logsMeter ?? 0
	const tracesUsage = data?.billingDetails.tracesMeter ?? 0

	const includedSessions = data?.billingDetails.plan.sessionsLimit ?? 0
	const includedErrors = data?.billingDetails.plan.errorsLimit ?? 0
	const includedLogs = data?.billingDetails.plan.logsLimit ?? 0
	const includedTraces = data?.billingDetails.plan.tracesLimit ?? 0

	const planType = data?.billingDetails.plan.type ?? PlanType.Free

	const productSubtotal =
		getCostCents(
			ProductType.Sessions,
			sessionsRate,
			sessionsRetention,
			sessionsUsage,
			includedSessions,
		) +
		getCostCents(
			ProductType.Errors,
			errorsRate,
			errorsRetention,
			errorsUsage,
			includedErrors,
		) +
		getCostCents(
			ProductType.Logs,
			logsRate,
			logsRetention,
			logsUsage,
			includedLogs,
		) +
		getCostCents(
			ProductType.Traces,
			tracesRate,
			tracesRetention,
			tracesUsage,
			includedTraces,
		)

	const discountRatio = (100 - discountPercent) / 100

	const totalCents = isPaying
		? Math.max(
				Math.floor(
					(productSubtotal + baseAmount) * discountRatio -
						discountAmount,
				),
				0,
		  )
		: 0
	const discountCents = productSubtotal + baseAmount - totalCents

	const totalFormatted =
		'$ ' +
		toDecimal(dinero({ amount: Math.round(totalCents), currency: USD }))

	const sessionsLimit = isPaying
		? data?.workspace?.sessions_max_cents ?? undefined
		: 0

	const errorsLimit = isPaying
		? data?.workspace?.errors_max_cents ?? undefined
		: 0

	const logsLimit = isPaying
		? data?.workspace?.logs_max_cents ?? undefined
		: 0

	const tracesLimit = isPaying ? undefined : 0

	const hasExtras = baseAmount !== 0 || discountCents !== 0
	const baseAmountFormatted =
		'$ ' +
		toDecimal(dinero({ amount: Math.round(baseAmount), currency: USD }))
	const discountAmountFormatted =
		'$ ' +
		toDecimal(
			dinero({
				amount: Math.round(discountCents),
				currency: USD,
			}),
		)
	const discountUntilFormatted = data?.subscription_details.discount?.until
		? `until ${moment(data.subscription_details.discount.until).format(
				'MMMM Do, YYYY',
		  )}`
		: 'forever'

	return (
		<Box width="full" display="flex" justifyContent="center">
			<Stack height="full" px="8" cssClass={style.pageWrapper} gap="0">
				<Stack>
					<Heading level="h4">Billing plans</Heading>
					<Stack gap="10">
						<Text size="small" color="weak">
							Prices are usage based and flexible with your needs.{' '}
							<IconSolidInformationCircle
								size={12}
								onClick={() =>
									navigate(`/w/${workspace_id}/plan-features`)
								}
							/>
						</Text>
						<Text size="small" color="weak">
							Need a custom quote or want to commit to a minimum
							spend (at a discount)?{' '}
							<a href="mailto:sales@highlight.run">
								<Box display="inline-flex" alignItems="center">
									Reach out to sales <IconSolidArrowSmRight />
								</Box>
							</a>
						</Text>
					</Stack>
					{billingIssue ? (
						<Callout title="Update payment details" icon={false}>
							<Box
								display="flex"
								justifyContent="space-between"
								gap="24"
							>
								<Text
									color="moderate"
									weight="medium"
									size="small"
									cssClass={style.issueText}
								>
									Looks like there is an issue with your
									billing info. 😔 Please update your payment
									method here.
								</Text>
								<Button
									size="small"
									emphasis="high"
									trackingId="UpdatePaymentDetails"
									onClick={async () => {
										await openCustomerPortalUrl()
									}}
								>
									Update payment details
								</Button>
							</Box>
						</Callout>
					) : null}
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
							onClick={async () => {
								await openCustomerPortalUrl()
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
								navigate(
									`/w/${workspace_id}/current-plan/update-plan`,
								)
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
						rate={sessionsRate}
						retentionPeriod={sessionsRetention}
						billingLimitCents={sessionsLimit}
						usageAmount={sessionsUsage}
						includedQuantity={includedSessions}
						isPaying={isPaying}
						planType={planType}
						enableBillingLimits={
							data?.billingDetails.plan.enableBillingLimits
						}
						billingIssues={billingIssue}
					/>
					<Box borderTop="secondary" />
					<UsageCard
						productIcon={<IconSolidLightningBolt />}
						productType={ProductType.Errors}
						rate={errorsRate}
						retentionPeriod={errorsRetention}
						billingLimitCents={errorsLimit}
						usageAmount={errorsUsage}
						includedQuantity={includedErrors}
						isPaying={isPaying}
						planType={planType}
						enableBillingLimits={
							data?.billingDetails.plan.enableBillingLimits
						}
						billingIssues={billingIssue}
					/>
					<Box borderTop="secondary" />
					<UsageCard
						productIcon={<IconSolidLogs />}
						productType={ProductType.Logs}
						rate={logsRate}
						retentionPeriod={logsRetention}
						billingLimitCents={logsLimit}
						usageAmount={logsUsage}
						includedQuantity={includedLogs}
						isPaying={isPaying}
						planType={planType}
						enableBillingLimits={
							data?.billingDetails.plan.enableBillingLimits
						}
						billingIssues={billingIssue}
					/>
					<Box borderTop="secondary" />
					<UsageCard
						productIcon={<IconSolidSparkles />}
						productType={ProductType.Traces}
						rate={tracesRate}
						retentionPeriod={tracesRetention}
						billingLimitCents={tracesLimit}
						usageAmount={tracesUsage}
						includedQuantity={includedTraces}
						isPaying={isPaying}
						planType={planType}
						enableBillingLimits={
							data?.billingDetails.plan.enableBillingLimits
						}
						billingIssues={billingIssue}
					/>
				</Box>
				<Stack
					border="secondary"
					borderRadius="8"
					alignItems="center"
					py="16"
					px="12"
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
						<Stack gap="12" width="full">
							{data?.subscription_details.discount ? (
								<>
									<Box
										display="flex"
										alignItems="center"
										justifyContent="space-between"
									>
										<Box display="flex" gap="6">
											<Text>
												Discount (
												{
													data.subscription_details
														.discount.name
												}
												)
											</Text>
											<Text color="weak">
												{discountPercent
													? `${discountPercent}% off `
													: `${discountAmountFormatted} off `}
												{discountUntilFormatted}
											</Text>
										</Box>
										<Box
											display="flex"
											alignItems="center"
											gap="4"
										>
											<Text color="strong" weight="bold">
												-{discountAmountFormatted}
											</Text>
										</Box>
									</Box>
									<Box borderBottom="divider" />
								</>
							) : null}
							<Box
								display="flex"
								alignItems="center"
								justifyContent="space-between"
							>
								<Box display="flex" gap="6">
									<Text color="strong">
										Total per{' '}
										{data?.billingDetails.plan.interval ===
										'Annual'
											? 'year'
											: 'month'}
									</Text>
									{isPaying && (
										<Text color="weak">
											Due{' '}
											{moment(nextBillingDate).format(
												'MM/DD/YY',
											)}
										</Text>
									)}
								</Box>
								<Box
									display="flex"
									alignItems="center"
									color="p11"
									gap="4"
								>
									{hasExtras && (
										<Tooltip
											trigger={
												<IconSolidInformationCircle
													size={12}
												/>
											}
										>
											Includes a{' '}
											{data?.billingDetails.plan
												.interval === 'Annual'
												? 'yearly'
												: 'monthly'}{' '}
											base charge of {baseAmountFormatted}
											{discountPercent
												? ` with a ${discountPercent}% discount`
												: ''}
											{discountAmount
												? ` with a ${discountAmountFormatted} discount`
												: ''}
											.
										</Tooltip>
									)}
									<Text color="p11" weight="bold">
										{totalFormatted}
									</Text>
								</Box>
							</Box>
						</Stack>
					</Box>
				</Stack>
			</Stack>
		</Box>
	)
}

export default BillingPageV2

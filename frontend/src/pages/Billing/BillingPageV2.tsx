import { CalendlyButton } from '@components/CalendlyModal/CalendlyButton'
import LoadingBox from '@components/LoadingBox'
import { toast } from '@components/Toaster'
import { USD } from '@dinero.js/currencies'
import {
	Badge,
	Box,
	Callout,
	Heading,
	IconProps,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidExclamation,
	IconSolidInformationCircle,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPencil,
	IconSolidPlayCircle,
	IconSolidTraces,
	Menu,
	Stack,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { BarChart } from '@pages/Graphing/components/BarChart'
import { TIMESTAMP_KEY } from '@pages/Graphing/components/Graph'
import { dinero, toDecimal } from 'dinero.js'
import moment from 'moment'
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { Button } from '@/components/Button'
import { LoadingRightPanel } from '@/components/Loading/Loading'
import {
	useGetBillingDetailsQuery,
	useGetCustomerPortalUrlLazyQuery,
	useGetWorkspaceUsageHistoryQuery,
	useUpdateBillingDetailsMutation,
} from '@/graph/generated/hooks'
import {
	AwsMarketplaceSubscription,
	MetricAggregator,
	PlanType,
	ProductType,
	RetentionPeriod,
} from '@/graph/generated/schemas'
import {
	getCostCents,
	getNextBillingDate,
	PlanSelectStep,
	UpdatePlanModal,
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
	usageLimitAmount: number | undefined
	includedQuantity: number
	isPaying: boolean
	enableBillingLimits: boolean | undefined
	billingIssues: boolean
	setStep: (step: PlanSelectStep) => void
	awsMpSubscription?: AwsMarketplaceSubscription | null | undefined
	billingPeriodEnd?: moment.Moment
}

const UsageRangeOptions = ['Monthly', 'Weekly', 'Daily'] as const

const BucketCount = 12
const DaysInWeek = 7
const WeeksInMonth = 4

const UsageCard = ({
	productIcon,
	productType,
	rate,
	retentionPeriod,
	billingLimitCents,
	usageAmount,
	usageLimitAmount,
	planType,
	includedQuantity,
	isPaying,
	enableBillingLimits,
	billingIssues,
	setStep,
	awsMpSubscription,
	billingPeriodEnd,
}: UsageCardProps) => {
	const { workspace_id } = useParams<{
		workspace_id: string
	}>()

	const [usageRange, setRange] = React.useState<{
		start: moment.Moment
		end: moment.Moment
	}>({
		start: (moment(billingPeriodEnd) ?? moment()).subtract(3, 'months'),
		end: moment(billingPeriodEnd) ?? moment(),
	})

	const setUsageRange = (option: 'Monthly' | 'Weekly' | 'Daily') => {
		setRange({
			start: moment().subtract(
				option === 'Monthly'
					? BucketCount * DaysInWeek * WeeksInMonth
					: option === 'Weekly'
						? BucketCount * DaysInWeek
						: BucketCount,
				'days',
			),
			end: moment(),
		})
	}

	const { data: usageHistoryData } = useGetWorkspaceUsageHistoryQuery({
		variables: {
			workspace_id: workspace_id!,
			product_type: productType,
			date_range: {
				start_date: usageRange.start.toISOString(),
				end_date: usageRange.end.toISOString(),
			},
		},
	})
	const usageHistory = usageHistoryData?.usageHistory?.usage

	const costCents = isPaying
		? getCostCents(
				productType,
				rate,
				retentionPeriod,
				usageAmount,
				includedQuantity,
			)
		: 0

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
			<Box display="flex" gap="8" flexDirection="column">
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
					{awsMpSubscription?.product_code ? null : (
						<Text color="n12">{costFormatted}</Text>
					)}
				</Box>
				<Box display="flex" gap="4">
					{!enableBillingLimits ? (
						<Tooltip
							maxWidth={177}
							delayed
							trigger={
								<Badge
									size="medium"
									shape="basic"
									kind="primary"
									variant="gray"
									label={`${usageAmount.toLocaleString()} ${productType.toLocaleLowerCase()} this month`}
									iconEnd={
										<IconSolidInformationCircle size={12} />
									}
								></Badge>
							}
						>
							<Box padding="4">
								<Text size="xSmall" color="moderate">
									We’ve ingested{' '}
									<b>
										{usageAmount.toLocaleString()}{' '}
										{productType.toLocaleLowerCase()}
									</b>{' '}
									this month. {includedQuantity} are included
									on the {planType} tier.
								</Text>
							</Box>
						</Tooltip>
					) : null}
					<Tooltip
						maxWidth={177}
						delayed
						trigger={
							<Badge
								size="medium"
								shape="basic"
								kind="secondary"
								label={RETENTION_PERIOD_LABELS[retentionPeriod]}
								iconEnd={
									<IconSolidInformationCircle size={12} />
								}
							/>
						}
					>
						<Box padding="4">
							<Text size="xSmall" color="moderate">
								We retain your{' '}
								<b>{productType.toLocaleLowerCase()}</b> for{' '}
								{RETENTION_PERIOD_LABELS[retentionPeriod]}. Data
								is deleted after that period.
							</Text>
						</Box>
					</Tooltip>
					{enableBillingLimits ? (
						<Tooltip
							maxWidth={177}
							delayed
							trigger={
								<Badge
									size="medium"
									shape="basic"
									kind="secondary"
									label={`Billing Limit: ${
										limitFormatted ?? 'Unlimited'
									}`}
									iconEnd={
										<IconSolidInformationCircle size={12} />
									}
								/>
							}
						>
							<Box padding="4">
								<Text size="xSmall" color="moderate">
									<b>{productType}</b> will not be recorded
									once this billing limit is reached.
								</Text>
							</Box>
						</Tooltip>
					) : null}
					{billingLimitCents === 0 ? (
						<Tag
							iconRight={<IconSolidCheveronRight />}
							kind="secondary"
							emphasis="low"
							shape="basic"
							onClick={() => {
								setStep('Configure plan')
							}}
						>
							Turn on {productType.toLocaleLowerCase()}
						</Tag>
					) : null}
				</Box>
			</Box>
			{enableBillingLimits ? (
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
							<Tooltip
								maxWidth={177}
								delayed
								trigger={<IconSolidExclamation size={12} />}
							>
								<Box padding="4">
									<Text size="xSmall" color="moderate">
										<b>{productType}</b> have exceeded your
										billing limit and are not being
										recorded.
									</Text>
								</Box>
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
			) : null}
			<Box
				width="full"
				height="full"
				padding="8"
				gap="4"
				display="flex"
				flexDirection="column"
				alignItems="flex-end"
				border="dividerWeak"
				borderRadius="6"
				style={{
					backgroundColor: vars.theme.static.surface.raised,
				}}
			>
				<Box
					width="full"
					height="full"
					display="flex"
					justifyContent="space-between"
					alignItems="center"
				>
					<Text size="xSmall" color="moderate">
						Past Usage
					</Text>
					<Menu>
						<Menu.Button
							iconRight={<IconSolidCheveronDown />}
							size="xSmall"
							kind="secondary"
							emphasis="medium"
							style={{
								border: vars.border.secondary,
								borderRadius: 6,
								backgroundColor:
									vars.theme.static.surface.raised,
							}}
						>
							<Text size="xSmall" color="moderate">
								{usageRange.end.diff(usageRange.start, 'day') >
								100
									? 'Monthly'
									: usageRange.end.diff(
												usageRange.start,
												'day',
										  ) > 40
										? 'Weekly'
										: 'Daily'}
							</Text>
						</Menu.Button>
						<Menu.List>
							{UsageRangeOptions.map((option) => (
								<Menu.Item
									key={option}
									onClick={() => setUsageRange(option)}
								>
									<Box display="flex" alignItems="center">
										<Text size="xSmall" color="moderate">
											{option}
										</Text>
									</Box>
								</Menu.Item>
							))}
						</Menu.List>
					</Menu>
				</Box>
				<Box
					width="full"
					style={{
						height: 100,
					}}
				>
					{usageHistory?.buckets ? (
						<BarChart
							data={usageHistory.buckets.map((b) => ({
								[TIMESTAMP_KEY]:
									(b.bucket_min + b.bucket_max) / 2,
								['Ingested']: b.metric_value,
							}))}
							yAxisFunction={MetricAggregator.Count}
							xAxisMetric={TIMESTAMP_KEY}
							yAxisMetric="Ingested"
							series={['Ingested']}
							strokeColors={[vars.theme.static.content.moderate]}
							viewConfig={{
								type: 'Bar chart',
								showLegend: true,
							}}
						/>
					) : (
						<LoadingBox />
					)}
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

	const location = useLocation()
	const [step, setStep] = React.useState<PlanSelectStep | null>(null)

	const { data, loading, refetch } = useGetBillingDetailsQuery({
		variables: {
			workspace_id: workspace_id!,
		},
	})

	const billingIssue = data?.subscription_details.billingIssue ?? false

	const [openCustomerPortalUrl] = useGetCustomerPortalUrlLazyQuery({
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
				toast.success('Billing plan saved!')
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
	const isAWSMP =
		!!data?.billingDetails.plan.aws_mp_subscription?.product_code

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

	const sessionsLimit = data?.billingDetails.sessionsBillingLimit ?? undefined
	const errorsLimit = data?.billingDetails.errorsBillingLimit ?? undefined
	const logsLimit = data?.billingDetails.logsBillingLimit ?? undefined
	const tracesLimit = data?.billingDetails.tracesBillingLimit ?? undefined

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

	const sessionsSpendLimit = isPaying
		? (data?.workspace?.sessions_max_cents ?? undefined)
		: 0

	const errorsSpendLimit = isPaying
		? (data?.workspace?.errors_max_cents ?? undefined)
		: 0

	const logsSpendLimit = isPaying
		? (data?.workspace?.logs_max_cents ?? undefined)
		: 0

	const tracesSpendLimit = isPaying
		? (data?.workspace?.traces_max_cents ?? undefined)
		: 0

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
			<UpdatePlanModal
				currentPlanType={
					data?.billingDetails.plan.type === PlanType.Free
						? PlanType.Graduated
						: (data?.billingDetails.plan.type ?? PlanType.Graduated)
				}
				step={step}
				setStep={setStep}
			/>
			<Stack height="full" px="8" cssClass={style.pageWrapper} gap="0">
				<Stack>
					<Heading level="h4">Billing plans</Heading>
					{isAWSMP ? null : (
						<Box display="inline-flex" gap="4" alignItems="center">
							<Text size="small" color="weak">
								Prices are flexible around your needs. Custom
								quote?
							</Text>
							<CalendlyButton
								text="Book a call."
								size="xSmall"
								emphasis="low"
								howCanWeHelp="Custom quote"
							/>
						</Box>
					)}
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
				<Stack mt="24" gap="8">
					<Text size="small" weight="bold" color="strong">
						Current plan's details
					</Text>
					<Box
						display="flex"
						alignItems="center"
						alignSelf="stretch"
						justifyContent="space-between"
						background="elevated"
						borderRadius="6"
						py="8"
						px="12"
					>
						<Box m="8">
							<Text size="small" color="strong">
								{isPaying
									? isAWSMP
										? 'AWS Marketplace'
										: data?.billingDetails.plan.type ===
											  PlanType.Graduated
											? 'Pay as you go'
											: data?.billingDetails.plan.type ===
												  PlanType.UsageBased
												? 'Usage based'
												: data?.billingDetails.plan.type
									: 'Free'}
							</Text>
						</Box>
						{isAWSMP ? (
							<Box display="flex" gap="6">
								<Button
									trackingId="BillingPage AWSMP Edit"
									size="small"
									emphasis="high"
									kind="primary"
									onClick={() =>
										window.open(
											`https://aws.amazon.com/marketplace/pp/prodview-frmk25gznwywm`,
											'_blank',
										)
									}
								>
									View in AWS Marketplace
								</Button>
							</Box>
						) : (
							<Box display="flex" gap="6">
								{isPaying ? (
									<Button
										trackingId="BillingPage EditCurrentPlan"
										size="small"
										emphasis="low"
										kind="secondary"
										iconLeft={<IconSolidPencil />}
										onClick={() =>
											setStep('Configure plan')
										}
									>
										Edit current plan
									</Button>
								) : null}
								<Button
									trackingId="BillingPage UpgradePlan"
									size="small"
									emphasis="high"
									kind="primary"
									onClick={() => setStep('Select plan')}
								>
									Select a plan
								</Button>
							</Box>
						)}
					</Box>
				</Stack>
				<Box
					display="flex"
					flexDirection="column"
					border="secondary"
					borderRadius="8"
					py="12"
					gap="12"
					mt="8"
				>
					{[
						{
							icon: <IconSolidPlayCircle />,
							productType: ProductType.Sessions,
							rate: sessionsRate,
							retentionPeriod: sessionsRetention,
							billingLimitCents: sessionsSpendLimit,
							usageAmount: sessionsUsage,
							usageLimitAmount: sessionsLimit,
							includedQuantity: includedSessions,
						},
						{
							icon: <IconSolidLightningBolt />,
							productType: ProductType.Errors,
							rate: errorsRate,
							retentionPeriod: errorsRetention,
							billingLimitCents: errorsSpendLimit,
							usageAmount: errorsUsage,
							usageLimitAmount: errorsLimit,
							includedQuantity: includedErrors,
						},
						{
							icon: <IconSolidLogs />,
							productType: ProductType.Logs,
							rate: logsRate,
							retentionPeriod: logsRetention,
							billingLimitCents: logsSpendLimit,
							usageAmount: logsUsage,
							usageLimitAmount: logsLimit,
							includedQuantity: includedLogs,
						},
						{
							icon: <IconSolidTraces />,
							productType: ProductType.Traces,
							rate: tracesRate,
							retentionPeriod: tracesRetention,
							billingLimitCents: tracesSpendLimit,
							usageAmount: tracesUsage,
							usageLimitAmount: tracesLimit,
							includedQuantity: includedTraces,
						},
					].map((product, idx) => (
						<>
							<UsageCard
								productIcon={<IconSolidPlayCircle />}
								awsMpSubscription={
									data?.billingDetails?.plan
										.aws_mp_subscription
								}
								isPaying={isPaying}
								planType={planType}
								enableBillingLimits={
									data?.billingDetails.plan
										.enableBillingLimits
								}
								billingIssues={billingIssue}
								setStep={setStep}
								billingPeriodEnd={
									(data?.workspace?.next_invoice_date ??
									data?.workspace?.billing_period_end)
										? moment(
												data?.workspace
													?.next_invoice_date ??
													data?.workspace
														?.billing_period_end,
											)
										: undefined
								}
								{...product}
							/>
							{idx < 3 ? <Box borderTop="secondary" /> : null}
						</>
					))}
				</Box>
				{isAWSMP ? null : (
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
														data
															.subscription_details
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
												<Text
													color="strong"
													weight="bold"
												>
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
											{data?.billingDetails.plan
												.interval === 'Annual'
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
												maxWidth={177}
												delayed
												trigger={
													<IconSolidInformationCircle
														size={12}
													/>
												}
											>
												<Box padding="4">
													<Text
														size="xSmall"
														color="moderate"
													>
														Includes a{' '}
														{data?.billingDetails
															.plan.interval ===
														'Annual'
															? 'yearly'
															: 'monthly'}{' '}
														base charge of{' '}
														{baseAmountFormatted}
														{discountPercent
															? ` with a ${discountPercent}% discount`
															: ''}
														{discountAmount
															? ` with a ${discountAmountFormatted} discount`
															: ''}
														.
													</Text>
												</Box>
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
				)}
			</Stack>
		</Box>
	)
}

export default BillingPageV2

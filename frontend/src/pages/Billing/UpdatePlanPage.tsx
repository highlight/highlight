import { USD } from '@dinero.js/currencies'
import {
	Badge,
	Box,
	Form,
	Heading,
	IconProps,
	IconSolidArrowSmRight,
	IconSolidCheveronRight,
	IconSolidInformationCircle,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	IconSolidPlus,
	IconSolidSparkles,
	IconSolidX,
	Input,
	Stack,
	Tag,
	Text,
	Tooltip,
	useFormStore,
} from '@highlight-run/ui/components'
import { loadStripe } from '@stripe/stripe-js'
import { message } from 'antd'
import { dinero, toDecimal } from 'dinero.js'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/Button'
import {
	useCreateOrUpdateStripeSubscriptionMutation,
	useGetBillingDetailsQuery,
	useSaveBillingPlanMutation,
} from '@/graph/generated/hooks'
import { namedOperations } from '@/graph/generated/operations'
import {
	PlanType,
	RetentionPeriod,
	SubscriptionInterval,
} from '@/graph/generated/schemas'
import {
	RETENTION_PERIOD_LABELS,
	tryCastDate,
} from '@/pages/Billing/utils/utils'
import { formatNumber, formatNumberWithDelimiters } from '@/util/numbers'
import { useParams } from '@/util/react-router/useParams'

import * as style from './UpdatePlanPage.css'

type ProductType = 'Sessions' | 'Errors' | 'Logs' | 'Traces'

const RETENTION_OPTIONS = {
	Sessions: [
		RetentionPeriod.ThreeMonths,
		RetentionPeriod.SixMonths,
		RetentionPeriod.TwelveMonths,
		RetentionPeriod.TwoYears,
	],
	Errors: [
		RetentionPeriod.ThreeMonths,
		RetentionPeriod.SixMonths,
		RetentionPeriod.TwelveMonths,
		RetentionPeriod.TwoYears,
	],
	Logs: [RetentionPeriod.ThirtyDays],
	Traces: [RetentionPeriod.ThirtyDays],
} as const

const RETENTION_MULTIPLIER = {
	[RetentionPeriod.ThirtyDays]: 1,
	[RetentionPeriod.ThreeMonths]: 1,
	[RetentionPeriod.SixMonths]: 1.5,
	[RetentionPeriod.TwelveMonths]: 2,
	[RetentionPeriod.TwoYears]: 2.5,
} as const

const BASE_UNIT_COST_CENTS = {
	Sessions: 2000,
	Errors: 20,
	Logs: 150,
	Traces: 150,
} as const

const UNIT_QUANTITY = {
	Sessions: 1_000,
	Errors: 1_000,
	Logs: 1_000_000,
	Traces: 1_000_000,
} as const

export const getCostCents = (
	productType: ProductType,
	rate: number | undefined,
	retentionPeriod: RetentionPeriod,
	quantity: number,
	includedQuantity: number,
): number => {
	if (!rate) {
		rate = BASE_UNIT_COST_CENTS[productType] / UNIT_QUANTITY[productType]
	}
	return Math.floor(
		rate *
			RETENTION_MULTIPLIER[retentionPeriod] *
			Math.max(quantity - includedQuantity, 0),
	)
}

export const getQuantity = (
	productType: ProductType,
	rate: number | undefined,
	retentionPeriod: RetentionPeriod,
	totalCents: number | undefined,
	includedQuantity: number,
): number | undefined => {
	if (totalCents === undefined) {
		return undefined
	}

	if (!rate) {
		rate = BASE_UNIT_COST_CENTS[productType] / UNIT_QUANTITY[productType]
	}
	return Math.floor(
		((totalCents / 100) * UNIT_QUANTITY[productType]) /
			(rate * RETENTION_MULTIPLIER[retentionPeriod]) +
			includedQuantity,
	)
}

export const getNextBillingDate = (
	isPaying: boolean,
	nextInvoiceDate: Date | undefined,
	billingPeriodEnd: Date | undefined,
) => {
	if (isPaying && nextInvoiceDate && billingPeriodEnd) {
		return nextInvoiceDate < billingPeriodEnd
			? nextInvoiceDate
			: billingPeriodEnd
	} else if (isPaying && billingPeriodEnd) {
		return billingPeriodEnd
	} else {
		return moment().add(1, 'M').toDate()
	}
}

export const getStripePromiseOrNull = () => {
	const stripe_publishable_key = import.meta.env.REACT_APP_STRIPE_API_PK
	if (stripe_publishable_key) {
		return loadStripe(stripe_publishable_key)
	}
	return null
}

const stripePromiseOrNull = getStripePromiseOrNull()

type ProductCardProps = {
	productIcon: React.ReactElement<IconProps>
	productType: ProductType
	rate: number | undefined
	retentionPeriod: RetentionPeriod
	planType: PlanType
	setRetentionPeriod: (rp: RetentionPeriod) => void
	limitCents: number | undefined
	setLimitCents: ((limit: number | undefined) => void) | undefined
	includedQuantity: number
	usageAmount: number
	predictedUsageAmount: number
}

interface UpdatePlanForm {
	sessionsRetention: RetentionPeriod
	sessionsLimitCents: number | undefined
	errorsRetention: RetentionPeriod
	errorsLimitCents: number | undefined
	logsRetention: RetentionPeriod
	logsLimitCents: number | undefined
	tracesRetention: RetentionPeriod
}

type LimitButtonProps = {
	limitCents: number | undefined
	setLimitCents: (limit: number | undefined) => void
	defaultLimit: number
}

const LimitButton = ({
	limitCents,
	setLimitCents,
	defaultLimit,
}: LimitButtonProps) => {
	const hasLimit = limitCents !== undefined
	return (
		<Box display="flex" alignItems="center" gap="4">
			{hasLimit ? (
				<>
					$
					<Input
						name="input"
						type="number"
						min="0"
						value={limitCents / 100}
						onChange={(e) => {
							setLimitCents(
								Math.round(
									parseFloat(e.target.value || '0') * 100,
								),
							)
						}}
						style={{ marginTop: -4 }}
					/>
					<Button
						trackingId="UpdatePlanClose"
						kind="secondary"
						emphasis="low"
						onClick={() => {
							setLimitCents(undefined)
						}}
					>
						<IconSolidX />
					</Button>
				</>
			) : (
				<Button
					trackingId=""
					iconLeft={<IconSolidPlus />}
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						setLimitCents(Math.round(defaultLimit))
					}}
				>
					Add Limit
				</Button>
			)}
		</Box>
	)
}

const ProductCard = ({
	productIcon,
	productType,
	rate,
	retentionPeriod,
	setRetentionPeriod,
	limitCents,
	setLimitCents,
	includedQuantity,
	usageAmount,
	predictedUsageAmount,
}: ProductCardProps) => {
	const unitCost = BASE_UNIT_COST_CENTS[productType]
	const unitCostCents =
		(rate ? Math.round(rate * UNIT_QUANTITY[productType]) : unitCost) *
		RETENTION_MULTIPLIER[retentionPeriod]

	const unitQuantity = UNIT_QUANTITY[productType]
	const quantityFormatted = formatNumber(unitQuantity)

	const unitCostFormatted =
		'$ ' + toDecimal(dinero({ amount: unitCostCents, currency: USD }))

	const netUsageAmount = Math.max(predictedUsageAmount - includedQuantity, 0)

	const predictedCostCents = getCostCents(
		productType,
		rate,
		retentionPeriod,
		predictedUsageAmount,
		includedQuantity,
	)

	const currentCostCents = getCostCents(
		productType,
		rate,
		retentionPeriod,
		usageAmount,
		includedQuantity,
	)

	const totalCostCents =
		limitCents !== undefined
			? Math.max(
					Math.min(predictedCostCents, limitCents),
					currentCostCents,
			  )
			: predictedCostCents

	const totalCostFormatted =
		'est. $ ' + toDecimal(dinero({ amount: totalCostCents, currency: USD }))

	return (
		<Box
			display="flex"
			flexDirection="row"
			width="full"
			justifyContent="space-between"
		>
			<Box
				display="flex"
				flexDirection="column"
				cssClass={style.productSelections}
			>
				<Box display="flex" gap="4" alignItems="center">
					{productIcon}
					{productType}
				</Box>
				<Box cssClass={style.formSection}>
					<Form.NamedSection label="Retention" name="Retention">
						<Box display="flex" gap="4">
							{RETENTION_OPTIONS[productType].map((r) => {
								return (
									<Button
										key={r}
										trackingId={`Retention${r}`}
										kind={
											retentionPeriod === r
												? 'primary'
												: 'secondary'
										}
										emphasis={
											retentionPeriod === r
												? 'high'
												: 'low'
										}
										onClick={() => {
											setRetentionPeriod(r)
										}}
									>
										{RETENTION_PERIOD_LABELS[r]}
									</Button>
								)
							})}
						</Box>
					</Form.NamedSection>
				</Box>
				{setLimitCents !== undefined && (
					<Box cssClass={style.formSection}>
						<Form.NamedSection
							label="Limit"
							name="Limit"
							tag={
								<Tooltip
									trigger={
										<IconSolidInformationCircle size={12} />
									}
								>
									If a billing limit is added, extra{' '}
									{productType.toLowerCase()} will not be
									recorded once the limit is reached.
								</Tooltip>
							}
						>
							<Box display="flex">
								<LimitButton
									limitCents={limitCents}
									setLimitCents={setLimitCents}
									defaultLimit={1.3 * predictedCostCents}
								/>
							</Box>
						</Form.NamedSection>
					</Box>
				)}
			</Box>
			<Box
				display="flex"
				gap="4"
				cssClass={style.predictedCost}
				flexDirection="column"
			>
				<Box display="flex" gap="4">
					Predicted cost
				</Box>
				<Box
					display="flex"
					flexDirection="column"
					gap="6"
					padding="8"
					borderRadius="8"
					cssClass={style.costBreakdown}
				>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
						alignItems="center"
						cssClass={style.costLineItem}
					>
						<Text color="weak" size="xSmall">
							Price / {quantityFormatted} {productType}
						</Text>
						<Text size="xSmall">{unitCostFormatted}</Text>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
						alignItems="center"
						cssClass={style.costLineItem}
					>
						<Text color="weak" size="xSmall">
							{productType}
						</Text>
						<Text size="xSmall">
							{formatNumberWithDelimiters(predictedUsageAmount)}
						</Text>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
						alignItems="center"
						cssClass={style.costLineItem}
					>
						<Text color="weak" size="xSmall">
							- Included
						</Text>
						<Text size="xSmall">
							{formatNumberWithDelimiters(includedQuantity)}
						</Text>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
						alignItems="center"
						cssClass={style.costLineItem}
					>
						<Text color="weak" size="xSmall">
							= Net
						</Text>
						<Text size="xSmall">
							{formatNumberWithDelimiters(netUsageAmount)}
						</Text>
					</Box>
					<Box borderBottom="divider" />
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
						alignItems="center"
						cssClass={style.costLineItem}
					>
						<Text color="weak" size="xSmall">
							Total
						</Text>
						<Badge
							size="medium"
							shape="basic"
							variant="gray"
							label={totalCostFormatted}
							iconEnd={
								<Tooltip
									trigger={
										<IconSolidInformationCircle size={12} />
									}
								>
									Estimated cost based on trailing 7 day
									usage.
								</Tooltip>
							}
						></Badge>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

type BillingPageProps = {}

const UpdatePlanPage = ({}: BillingPageProps) => {
	const { workspace_id } = useParams<{
		workspace_id: string
	}>()

	const navigate = useNavigate()

	const formStore = useFormStore<UpdatePlanForm>({
		defaultValues: {
			sessionsRetention: RetentionPeriod.ThreeMonths,
			sessionsLimitCents: undefined,
			errorsRetention: RetentionPeriod.ThreeMonths,
			errorsLimitCents: undefined,
			logsRetention: RetentionPeriod.ThirtyDays,
			logsLimitCents: undefined,
			tracesRetention: RetentionPeriod.ThirtyDays,
		},
	})
	const formState = formStore.useState()

	const [saveBillingPlan, { loading: billingPlanLoading }] =
		useSaveBillingPlanMutation({
			refetchQueries: [namedOperations.Query.GetBillingDetails],
		})

	const { data, loading } = useGetBillingDetailsQuery({
		variables: {
			workspace_id: workspace_id!,
		},
		onCompleted: (data) => {
			formStore.setValues({
				sessionsRetention:
					data.workspace?.retention_period ??
					RetentionPeriod.SixMonths,
				sessionsLimitCents:
					data.workspace?.sessions_max_cents ?? undefined,
				errorsRetention:
					data.workspace?.errors_retention_period ??
					RetentionPeriod.SixMonths,
				errorsLimitCents: data.workspace?.errors_max_cents ?? undefined,
				logsRetention: RetentionPeriod.ThirtyDays,
				logsLimitCents: data.workspace?.logs_max_cents ?? undefined,
				tracesRetention: RetentionPeriod.ThirtyDays,
			})
		},
	})

	const [
		createOrUpdateStripeSubscription,
		{ data: stripeData, loading: stripeLoading },
	] = useCreateOrUpdateStripeSubscriptionMutation({ fetchPolicy: 'no-cache' })

	if (stripeData?.createOrUpdateStripeSubscription && stripePromiseOrNull) {
		;(async function () {
			const stripe = await stripePromiseOrNull
			stripe
				? await stripe.redirectToCheckout({
						sessionId:
							stripeData.createOrUpdateStripeSubscription ?? '',
				  })
				: { error: 'Error: could not load stripe client.' }
		})()
	}

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
	const daysUntilNextBillingDate = Math.ceil(
		(nextBillingDate.getTime() - Date.now()) / (1000 * 3600 * 24),
	)

	const planType = data?.billingDetails.plan.type ?? PlanType.Free

	const sessionsUsage = isPaying ? data?.billingDetails.meter ?? 0 : 0
	const predictedSessionsUsage = Math.ceil(
		sessionsUsage +
			daysUntilNextBillingDate *
				(data?.billingDetails.sessionsDailyAverage ?? 0),
	)
	const includedSessions = data?.billingDetails.plan.sessionsLimit ?? 0
	let predictedSessionsCost = getCostCents(
		'Sessions',
		data?.billingDetails.plan.sessionsRate,
		formState.values.sessionsRetention,
		predictedSessionsUsage,
		includedSessions,
	)
	const actualSessionsCost = getCostCents(
		'Sessions',
		data?.billingDetails.plan.sessionsRate,
		formState.values.sessionsRetention,
		sessionsUsage,
		includedSessions,
	)
	if (formState.values.sessionsLimitCents !== undefined) {
		predictedSessionsCost = Math.min(
			predictedSessionsCost,
			formState.values.sessionsLimitCents,
		)
	}
	predictedSessionsCost = Math.max(predictedSessionsCost, actualSessionsCost)

	const errorsUsage = isPaying ? data?.billingDetails.errorsMeter ?? 0 : 0
	const predictedErrorsUsage = Math.ceil(
		errorsUsage +
			daysUntilNextBillingDate *
				(data?.billingDetails.errorsDailyAverage ?? 0),
	)
	const includedErrors = data?.billingDetails.plan.errorsLimit ?? 0
	let predictedErrorsCost = getCostCents(
		'Errors',
		data?.billingDetails.plan.errorsRate,
		formState.values.errorsRetention,
		predictedErrorsUsage,
		includedErrors,
	)
	const actualErrorsCost = getCostCents(
		'Errors',
		data?.billingDetails.plan.errorsRate,
		formState.values.errorsRetention,
		errorsUsage,
		includedErrors,
	)
	if (formState.values.errorsLimitCents !== undefined) {
		predictedErrorsCost = Math.min(
			predictedErrorsCost,
			formState.values.errorsLimitCents,
		)
	}
	predictedErrorsCost = Math.max(predictedErrorsCost, actualErrorsCost)

	const logsUsage = isPaying ? data?.billingDetails.logsMeter ?? 0 : 0
	const predictedLogsUsage = Math.ceil(
		logsUsage +
			daysUntilNextBillingDate *
				(data?.billingDetails.logsDailyAverage ?? 0),
	)
	const includedLogs = data?.billingDetails.plan.logsLimit ?? 0
	let predictedLogsCost = getCostCents(
		'Logs',
		data?.billingDetails.plan.logsRate,
		formState.values.logsRetention,
		predictedLogsUsage,
		includedLogs,
	)
	const actualLogsCost = getCostCents(
		'Logs',
		data?.billingDetails.plan.logsRate,
		formState.values.logsRetention,
		logsUsage,
		includedLogs,
	)
	if (formState.values.logsLimitCents !== undefined) {
		predictedLogsCost = Math.min(
			predictedLogsCost,
			formState.values.logsLimitCents,
		)
	}
	predictedLogsCost = Math.max(predictedLogsCost, actualLogsCost)

	const tracesUsage = isPaying ? data?.billingDetails.tracesMeter ?? 0 : 0
	const predictedTracesUsage = Math.ceil(
		tracesUsage +
			daysUntilNextBillingDate *
				(data?.billingDetails.tracesDailyAverage ?? 0),
	)
	const includedTraces = data?.billingDetails.plan.tracesLimit ?? 0
	let predictedTracesCost = getCostCents(
		'Traces',
		data?.billingDetails.plan.tracesRate,
		formState.values.tracesRetention,
		predictedTracesUsage,
		includedTraces,
	)
	const actualTracesCost = getCostCents(
		'Traces',
		data?.billingDetails.plan.tracesRate,
		formState.values.logsRetention,
		tracesUsage,
		includedTraces,
	)
	predictedTracesCost = Math.max(predictedTracesCost, actualTracesCost)

	const baseAmount = data?.subscription_details.baseAmount ?? 0
	const discountPercent = data?.subscription_details.discountPercent ?? 0
	const discountAmount = data?.subscription_details.discountAmount ?? 0

	const productSubtotal =
		predictedSessionsCost +
		predictedErrorsCost +
		predictedLogsCost +
		predictedTracesCost

	const discountRatio = (100 - discountPercent) / 100

	const predictedTotalCents = Math.max(
		Math.floor(
			(productSubtotal + baseAmount) * discountRatio - discountAmount,
		),
		0,
	)

	const predictedTotalFormatted =
		'est. $ ' +
		toDecimal(dinero({ amount: predictedTotalCents, currency: USD }))

	const hasExtras =
		baseAmount !== 0 || discountAmount !== 0 || discountPercent !== 0
	const enableBillingLimits = data?.billingDetails.plan.enableBillingLimits
	const baseAmountFormatted =
		'$' + toDecimal(dinero({ amount: baseAmount, currency: USD }))
	const discountAmountFormatted =
		'$' + toDecimal(dinero({ amount: discountAmount, currency: USD }))

	return (
		<Box
			width="full"
			display="flex"
			justifyContent="center"
			flexDirection="column"
		>
			<Box
				cssClass={style.pageHeader}
				display="flex"
				px="8"
				py="6"
				justifyContent="space-between"
				width="full"
				borderBottom="divider"
				position="absolute"
			>
				<Button
					trackingId="UpdatePlanClose"
					kind="secondary"
					emphasis="low"
					onClick={() => {
						navigate('../current-plan')
					}}
				>
					<IconSolidX />
				</Button>
				<Box display="flex" flexDirection="row" gap="6">
					<Button
						trackingId="UpdatePlanSave"
						onClick={() => {
							saveBillingPlan({
								variables: {
									workspace_id: workspace_id!,
									sessionsLimitCents:
										formState.values.sessionsLimitCents,
									sessionsRetention:
										formState.values.sessionsRetention,
									errorsLimitCents:
										formState.values.errorsLimitCents,
									errorsRetention:
										formState.values.errorsRetention,
									logsLimitCents:
										formState.values.logsLimitCents,
									logsRetention:
										formState.values.logsRetention,
								},
							})
								.then(() => {
									if (!isPaying) {
										createOrUpdateStripeSubscription({
											variables: {
												workspace_id: workspace_id!,
												plan_type: PlanType.Graduated,
												interval:
													SubscriptionInterval.Monthly,
												retention_period:
													RetentionPeriod.ThreeMonths,
											},
										})
									} else {
										message.success('Billing plan saved!')
										navigate('../current-plan')
									}
								})
								.catch(() => {
									message.error(
										'Failed to save billing plan details',
									)
								})
						}}
						disabled={billingPlanLoading || stripeLoading}
					>
						{isPaying
							? 'Save billing plan'
							: 'Enter payment details'}
					</Button>
				</Box>
			</Box>
			<Box display="flex" justifyContent="center">
				<Box
					px="8"
					cssClass={style.pageWrapper}
					display="flex"
					flexDirection="column"
				>
					{!isPaying && (
						<Box mb="24" display="flex" gap="4">
							<Box
								border="secondary"
								borderRadius="6"
								cssClass={style.step}
								textAlign="center"
								flex="stretch"
								display="flex"
								alignItems="center"
								justifyContent="center"
								color="p11"
								borderColor="p6"
							>
								<Text>1. Update plan</Text>
							</Box>
							<Box
								border="secondary"
								borderRadius="6"
								cssClass={style.step}
								textAlign="center"
								flex="stretch"
								display="flex"
								alignItems="center"
								justifyContent="center"
								color="n8"
								borderColor="n3"
							>
								<Text>2. Enter payment details</Text>
							</Box>
						</Box>
					)}
					<Box display="flex" alignItems="center">
						<Tag
							kind="secondary"
							shape="basic"
							onClick={() => {
								navigate('../current-plan')
							}}
						>
							Billing plans
						</Tag>
						<IconSolidCheveronRight />
						<Badge
							kind="secondary"
							shape="basic"
							label="Update plan details"
							size="medium"
						/>
					</Box>
					<Stack mt="12">
						<Box>
							<Heading level="h4">Update plan details</Heading>
						</Box>
						<Box>
							<Text size="small" weight="medium">
								Prices are usage based and flexible with your
								needs. Need a custom quote or want to commit to
								a minimum spend (at a discount)?{' '}
								<a href="mailto:sales@highlight.run">
									<Box
										display="inline-flex"
										alignItems="center"
									>
										Reach out to sales{' '}
										<IconSolidArrowSmRight />
									</Box>
								</a>
							</Text>
						</Box>
					</Stack>
					<Form store={formStore}>
						<Box
							display="flex"
							flexDirection="column"
							gap="16"
							mt="24"
						>
							<ProductCard
								productIcon={<IconSolidPlayCircle />}
								productType="Sessions"
								rate={data?.billingDetails.plan.sessionsRate}
								retentionPeriod={
									formState.values.sessionsRetention
								}
								setRetentionPeriod={(rp) =>
									formStore.setValue(
										formStore.names.sessionsRetention,
										rp,
									)
								}
								limitCents={formState.values.sessionsLimitCents}
								setLimitCents={
									enableBillingLimits
										? (l) =>
												formStore.setValue(
													formStore.names
														.sessionsLimitCents,
													l,
												)
										: undefined
								}
								usageAmount={sessionsUsage}
								predictedUsageAmount={predictedSessionsUsage}
								includedQuantity={includedSessions}
								planType={planType}
							/>
							<Box borderBottom="divider" />
							<ProductCard
								productIcon={<IconSolidLightningBolt />}
								productType="Errors"
								rate={data?.billingDetails.plan.errorsRate}
								retentionPeriod={
									formState.values.errorsRetention
								}
								setRetentionPeriod={(rp) =>
									formStore.setValue(
										formStore.names.errorsRetention,
										rp,
									)
								}
								limitCents={formState.values.errorsLimitCents}
								setLimitCents={
									enableBillingLimits
										? (l) =>
												formStore.setValue(
													formStore.names
														.errorsLimitCents,
													l,
												)
										: undefined
								}
								usageAmount={errorsUsage}
								predictedUsageAmount={predictedErrorsUsage}
								includedQuantity={includedErrors}
								planType={planType}
							/>
							<Box borderBottom="divider" />
							<ProductCard
								productIcon={<IconSolidLogs />}
								productType="Logs"
								rate={data?.billingDetails.plan.logsRate}
								retentionPeriod={formState.values.logsRetention}
								setRetentionPeriod={(rp) =>
									formStore.setValue(
										formStore.names.logsRetention,
										rp,
									)
								}
								limitCents={formState.values.logsLimitCents}
								setLimitCents={
									enableBillingLimits
										? (l) =>
												formStore.setValue(
													formStore.names
														.logsLimitCents,
													l,
												)
										: undefined
								}
								usageAmount={logsUsage}
								predictedUsageAmount={predictedLogsUsage}
								includedQuantity={includedLogs}
								planType={planType}
							/>
							<Box borderBottom="divider" />
							<ProductCard
								productIcon={<IconSolidSparkles />}
								productType="Traces"
								rate={data?.billingDetails.plan.tracesRate}
								retentionPeriod={
									formState.values.tracesRetention
								}
								setRetentionPeriod={(rp) =>
									formStore.setValue(
										formStore.names.tracesRetention,
										rp,
									)
								}
								limitCents={formState.values.logsLimitCents}
								setLimitCents={undefined}
								usageAmount={tracesUsage}
								predictedUsageAmount={predictedTracesUsage}
								includedQuantity={includedTraces}
								planType={planType}
							/>
							<Box borderBottom="divider" />
							<Box
								border="secondary"
								borderRadius="8"
								p="12"
								gap="12"
							>
								<Box
									display="flex"
									justifyContent="space-between"
								>
									<Box display="flex" gap="4">
										<Text color="n12">
											Total this month
										</Text>
										<Text>
											Due{' '}
											{moment(nextBillingDate).format(
												'MM/DD/YY',
											)}
										</Text>
									</Box>
									<Box
										display="flex"
										alignItems="center"
										color="p11"
										gap="4"
									>
										<Text color="p11" weight="bold">
											{predictedTotalFormatted}
										</Text>
										<Tooltip
											trigger={
												<IconSolidInformationCircle
													size={12}
												/>
											}
										>
											Estimated cost based on trailing 7
											day usage.
											{hasExtras && (
												<>
													{' '}
													Includes a monthly
													commitment of{' '}
													{baseAmountFormatted}
													{discountPercent
														? ` with a ${discountPercent}% discount`
														: ''}
													{discountAmount
														? ` with a ${discountAmountFormatted} discount`
														: ''}
													.
												</>
											)}
										</Tooltip>
									</Box>
								</Box>
							</Box>
						</Box>
					</Form>
				</Box>
			</Box>
		</Box>
	)
}

export default UpdatePlanPage

import EnterpriseFeatureButton from '@components/Billing/EnterpriseFeatureButton'
import { Modal } from '@components/Modal/ModalV2'
import Switch from '@components/Switch/Switch'
import { toast } from '@components/Toaster'
import { USD } from '@dinero.js/currencies'
import {
	Badge,
	Box,
	Callout,
	Form,
	IconProps,
	IconSolidChatAlt,
	IconSolidCheck,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidCog,
	IconSolidInformationCircle,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidOfficeBuilding,
	IconSolidPlayCircle,
	IconSolidPlus,
	IconSolidPuzzle,
	IconSolidReceiptTax,
	IconSolidServer,
	IconSolidTraces,
	IconSolidX,
	Input,
	Menu,
	Stack,
	Text,
	TextLink,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { loadStripe } from '@stripe/stripe-js'
import { getPlanChangeEmail } from '@util/billing/billing'
import { formatNumber, formatNumberWithDelimiters } from '@util/numbers'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { dinero, toDecimal } from 'dinero.js'
import moment from 'moment'
import React from 'react'
import ReactCollapsible from 'react-collapsible'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/Button'
import {
	useCreateOrUpdateStripeSubscriptionMutation,
	useGetBillingDetailsQuery,
	useGetCustomerPortalUrlLazyQuery,
	useSaveBillingPlanMutation,
} from '@/graph/generated/hooks'
import { namedOperations } from '@/graph/generated/operations'
import {
	PlanType,
	ProductType,
	RetentionPeriod,
} from '@/graph/generated/schemas'
import {
	PLANS_WITH_ENTERPRISE_FEATURES,
	RETENTION_PERIOD_LABELS,
	tryCastDate,
} from '@/pages/Billing/utils/utils'
import { useParams } from '@/util/react-router/useParams'

import { CalendlyButton } from '../../components/CalendlyModal/CalendlyButton'
import * as style from './UpdatePlanPage.css'

const STANDARD_RETENTION = RetentionPeriod.SevenDays

// TODO(vkorolik) billing for metrics ingest
const RETENTION_OPTIONS = {
	Sessions: [
		RetentionPeriod.SevenDays,
		RetentionPeriod.ThreeMonths,
		RetentionPeriod.SixMonths,
		RetentionPeriod.TwelveMonths,
		RetentionPeriod.TwoYears,
	],
	Errors: [
		RetentionPeriod.SevenDays,
		RetentionPeriod.ThreeMonths,
		RetentionPeriod.SixMonths,
		RetentionPeriod.TwelveMonths,
		RetentionPeriod.TwoYears,
	],
	Logs: [RetentionPeriod.ThirtyDays],
	Traces: [RetentionPeriod.ThirtyDays],
	Metrics: [RetentionPeriod.ThirtyDays],
} as const

const RETENTION_MULTIPLIER = {
	[RetentionPeriod.SevenDays]: 1,
	[RetentionPeriod.ThirtyDays]: 1,
	[RetentionPeriod.ThreeMonths]: 1,
	[RetentionPeriod.SixMonths]: 1.5,
	[RetentionPeriod.TwelveMonths]: 2,
	[RetentionPeriod.TwoYears]: 2.5,
	[RetentionPeriod.ThreeYears]: 3,
} as const

const BASE_UNIT_COST_CENTS = {
	Sessions: 2000,
	Errors: 20,
	Logs: 150,
	Traces: 150,
	Metrics: 150,
} as const

const UNIT_QUANTITY = {
	Sessions: 1_000,
	Errors: 1_000,
	Logs: 1_000_000,
	Traces: 1_000_000,
	Metrics: 1_000_000,
} as const

export const getCostCents = (
	productType: ProductType,
	rateCents: number | undefined,
	retentionPeriod: RetentionPeriod,
	quantity: number,
	includedQuantity: number,
): number => {
	if (!rateCents) {
		rateCents =
			BASE_UNIT_COST_CENTS[productType] / UNIT_QUANTITY[productType]
	}
	return Math.floor(
		rateCents *
			RETENTION_MULTIPLIER[retentionPeriod] *
			Math.max(quantity - includedQuantity, 0),
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
	enableBillingLimits: boolean
	limitCents: number | undefined
	setLimitCents: (limit: number | undefined) => void
	includedQuantity: number
	usageAmount: number
	predictedUsageAmount: number
	setHasChanges: (changes: boolean) => void
	setStep: (step: PlanSelectStep) => void
}

interface UpdatePlanForm {
	sessionsRetention: RetentionPeriod
	sessionsLimitCents: number | undefined
	errorsRetention: RetentionPeriod
	errorsLimitCents: number | undefined
	logsRetention: RetentionPeriod
	logsLimitCents: number | undefined
	tracesRetention: RetentionPeriod
	tracesLimitCents: number | undefined
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
						style={{ height: 24, width: 64 }}
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
					size="small"
					style={{
						border: vars.border.secondary,
					}}
					onClick={() => {
						setLimitCents(Math.round(defaultLimit))
					}}
				>
					<Box display="flex" alignItems="center" gap="4">
						Add Limit
					</Box>
				</Button>
			)}
		</Box>
	)
}

const ProductCard = ({
	productType,
	rate,
	retentionPeriod,
	setRetentionPeriod,
	enableBillingLimits,
	limitCents,
	setLimitCents,
	setHasChanges,
	includedQuantity,
	usageAmount,
	predictedUsageAmount,
	setStep,
}: ProductCardProps) => {
	const unitCost = BASE_UNIT_COST_CENTS[productType]
	const unitCostCents =
		(rate ? Math.round(rate * UNIT_QUANTITY[productType]) : unitCost) *
		RETENTION_MULTIPLIER[retentionPeriod]

	const unitQuantity = UNIT_QUANTITY[productType]
	const quantityFormatted = formatNumber(unitQuantity)

	const unitCostFormatted =
		'$ ' +
		toDecimal(dinero({ amount: Math.round(unitCostCents), currency: USD }))

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
		'est. $ ' +
		toDecimal(dinero({ amount: Math.round(totalCostCents), currency: USD }))

	return (
		<Box
			key={productType}
			py="12"
			px="16"
			display="flex"
			alignItems="flex-start"
			gap="12"
		>
			<Stack gap="12" width="full">
				<Stack gap="4" width="full">
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Box display="flex" alignItems="center" gap="12">
							<Switch
								trackingId={`${productType}-enable`}
								checked={
									limitCents === undefined || limitCents > 0
								}
								onChange={(checked) => {
									setLimitCents(checked ? undefined : 0)
								}}
							/>
							<Text size="small">{productType}</Text>
						</Box>
						<Box>
							<Badge
								size="medium"
								shape="basic"
								variant="gray"
								label={totalCostFormatted}
								iconEnd={
									<Tooltip
										delayed
										trigger={
											<IconSolidInformationCircle
												size={12}
											/>
										}
									>
										<Box
											p="8"
											display="flex"
											gap="4"
											cssClass={style.predictedCost}
											flexDirection="column"
										>
											<Box
												display="flex"
												flexDirection="column"
												gap="6"
												borderRadius="8"
												cssClass={style.costBreakdown}
											>
												<Box
													display="flex"
													flexDirection="row"
													justifyContent="space-between"
													alignItems="center"
													cssClass={
														style.costLineItem
													}
												>
													<Text
														weight="medium"
														color="weak"
														size="xSmall"
													>
														Price /{' '}
														{quantityFormatted}{' '}
														{productType}
													</Text>
													<Text
														size="xSmall"
														color="secondaryContentOnEnabled"
													>
														{unitCostFormatted}
													</Text>
												</Box>
												<Box
													display="flex"
													flexDirection="row"
													justifyContent="space-between"
													alignItems="center"
													cssClass={
														style.costLineItem
													}
												>
													<Text
														weight="medium"
														color="weak"
														size="xSmall"
													>
														{productType}
													</Text>
													<Text
														size="xSmall"
														color="secondaryContentOnEnabled"
													>
														{formatNumberWithDelimiters(
															predictedUsageAmount,
														)}
													</Text>
												</Box>
												<Box
													display="flex"
													flexDirection="row"
													justifyContent="space-between"
													alignItems="center"
													cssClass={
														style.costLineItem
													}
												>
													<Text
														weight="medium"
														color="weak"
														size="xSmall"
													>
														- Included
													</Text>
													<Text
														size="xSmall"
														color="secondaryContentOnEnabled"
													>
														{formatNumberWithDelimiters(
															includedQuantity,
														)}
													</Text>
												</Box>
												<Box borderBottom="divider" />
												<Box
													display="flex"
													flexDirection="row"
													justifyContent="space-between"
													alignItems="center"
													cssClass={
														style.costLineItem
													}
												>
													<Text
														weight="medium"
														color="weak"
														size="xSmall"
													>
														Total
													</Text>
													<Text
														size="xSmall"
														color="secondaryContentOnEnabled"
													>
														{formatNumberWithDelimiters(
															netUsageAmount,
														)}
													</Text>
												</Box>
											</Box>
										</Box>
									</Tooltip>
								}
							></Badge>
						</Box>
					</Box>
					<Box ml="40" display="flex" justifyContent="space-between">
						<Text size="small" color="weak">
							Capture {productType.toLocaleLowerCase()} for a
							specific retention period.
						</Text>
					</Box>
				</Stack>
				<Box
					display="flex"
					justifyContent="flex-start"
					gap="6"
					ml="40"
					alignItems="center"
				>
					{RETENTION_OPTIONS[productType].length > 1 ? (
						<Menu>
							<Menu.Button
								kind="secondary"
								size="small"
								emphasis="medium"
								style={{
									border: vars.border.secondary,
								}}
							>
								<Box display="flex" alignItems="center" gap="4">
									{RETENTION_PERIOD_LABELS[retentionPeriod]}
									<IconSolidCheveronDown />
								</Box>
							</Menu.Button>
							<Menu.List style={{ minWidth: 320 }}>
								{RETENTION_OPTIONS[productType].map((rp) => (
									<EnterpriseFeatureButton
										setting="enable_business_retention"
										name="Custom Data Retention"
										key="Custom Data Retention"
										fn={async () => {
											setRetentionPeriod(rp)
											setHasChanges(true)
										}}
										onShowModal={() =>
											setStep('Custom Data Retention')
										}
										variant="basic"
									>
										<Menu.Item key={rp}>
											<Box
												color="secondaryContentText"
												display="inline-flex"
												alignItems="center"
												gap="6"
												flexGrow={1}
											>
												<Text lines="1">
													{
														RETENTION_PERIOD_LABELS[
															rp
														]
													}
												</Text>
											</Box>
											{rp ===
											STANDARD_RETENTION ? null : (
												<Box
													display="flex"
													alignItems="center"
													justifyContent="flex-end"
												>
													<Badge
														size="small"
														label="Business"
													/>
												</Box>
											)}
										</Menu.Item>
									</EnterpriseFeatureButton>
								))}
							</Menu.List>
						</Menu>
					) : null}
					{enableBillingLimits && (
						<Box display="flex">
							<LimitButton
								limitCents={limitCents}
								setLimitCents={setLimitCents}
								defaultLimit={1.3 * predictedCostCents}
							/>
						</Box>
					)}
				</Box>
			</Stack>
		</Box>
	)
}

export type PlanSelectStep =
	| 'Select plan'
	| 'Configure plan'
	| 'Enter payment details'
	| 'Custom Data Retention'
	| null

type BillingPageProps = {
	selectedPlanType: PlanType
	setStep: (step: PlanSelectStep) => void
	showConfirmCloseModal: boolean
	setShowConfirmCloseModal: (show: boolean) => void
	setHasChanges: (show: boolean) => void
}

const UpdatePlanPage = ({
	selectedPlanType,
	setStep,
	showConfirmCloseModal,
	setShowConfirmCloseModal,
	setHasChanges,
}: BillingPageProps) => {
	const { workspace_id } = useParams<{
		workspace_id: string
	}>()

	const formStore = Form.useStore<UpdatePlanForm>({
		defaultValues: {
			sessionsRetention: RetentionPeriod.SevenDays,
			sessionsLimitCents: undefined,
			errorsRetention: RetentionPeriod.SevenDays,
			errorsLimitCents: undefined,
			logsRetention: RetentionPeriod.ThirtyDays,
			logsLimitCents: undefined,
			tracesRetention: RetentionPeriod.ThirtyDays,
			tracesLimitCents: undefined,
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
				tracesLimitCents: data.workspace?.traces_max_cents ?? undefined,
			})
		},
	})

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

	const [
		createOrUpdateStripeSubscription,
		{ data: stripeData, loading: stripeLoading },
	] = useCreateOrUpdateStripeSubscriptionMutation({
		fetchPolicy: 'no-cache',
		refetchQueries: [namedOperations.Query.GetBillingDetails],
	})

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
	const isPaying = data?.billingDetails.plan.type !== PlanType.Free

	React.useEffect(() => {
		if (!loading && !isPaying) {
			setHasChanges(true)
		}
	}, [isPaying, loading, setHasChanges])

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

	const sessionsUsage = isPaying ? data?.billingDetails.meter ?? 0 : 0
	const predictedSessionsUsage = Math.ceil(
		sessionsUsage +
			daysUntilNextBillingDate *
				(data?.billingDetails.sessionsDailyAverage ?? 0),
	)
	const includedSessions = data?.billingDetails.plan.sessionsLimit ?? 0
	let predictedSessionsCost = getCostCents(
		ProductType.Sessions,
		data?.billingDetails.plan.sessionsRate,
		formState.values.sessionsRetention,
		predictedSessionsUsage,
		includedSessions,
	)
	const actualSessionsCost = getCostCents(
		ProductType.Sessions,
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
		ProductType.Errors,
		data?.billingDetails.plan.errorsRate,
		formState.values.errorsRetention,
		predictedErrorsUsage,
		includedErrors,
	)
	const actualErrorsCost = getCostCents(
		ProductType.Errors,
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
		ProductType.Logs,
		data?.billingDetails.plan.logsRate,
		formState.values.logsRetention,
		predictedLogsUsage,
		includedLogs,
	)
	const actualLogsCost = getCostCents(
		ProductType.Logs,
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
		ProductType.Traces,
		data?.billingDetails.plan.tracesRate,
		formState.values.tracesRetention,
		predictedTracesUsage,
		includedTraces,
	)
	const actualTracesCost = getCostCents(
		ProductType.Traces,
		data?.billingDetails.plan.tracesRate,
		formState.values.logsRetention,
		tracesUsage,
		includedTraces,
	)
	if (formState.values.tracesLimitCents !== undefined) {
		predictedTracesCost = Math.min(
			predictedTracesCost,
			formState.values.tracesLimitCents,
		)
	}
	predictedTracesCost = Math.max(predictedTracesCost, actualTracesCost)

	const baseAmount =
		PLAN_BASE_FEES[selectedPlanType as keyof typeof PLAN_BASE_FEES] * 100
	const discountPercent = data?.subscription_details.discount?.percent ?? 0
	const discountAmount = data?.subscription_details.discount?.amount ?? 0

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
	const discountCents = productSubtotal + baseAmount - predictedTotalCents

	const predictedTotalFormatted = toDecimal(
		dinero({ amount: Math.round(predictedTotalCents), currency: USD }),
	)

	const enableBillingLimits = data?.billingDetails.plan.enableBillingLimits
	const baseAmountFormatted =
		'$' +
		toDecimal(dinero({ amount: Math.round(baseAmount), currency: USD }))
	const discountAmountFormatted =
		'$ ' +
		toDecimal(
			dinero({
				amount: Math.round(discountCents),
				currency: USD,
			}),
		)

	return (
		<Box
			width="full"
			display="flex"
			justifyContent="center"
			flexDirection="column"
		>
			{showConfirmCloseModal ? (
				<Modal>
					<Box
						width="full"
						display="flex"
						justifyContent="center"
						flexDirection="column"
						style={{ maxWidth: 324 }}
					>
						<Box p="12">
							<Text weight="medium" size="small" color="moderate">
								Are you sure you want to leave without updating
								your plan?
							</Text>
						</Box>
						<Box borderBottom="divider" />
						<Box
							display="flex"
							justifyContent="flex-end"
							alignItems="center"
							px="6"
							py="4"
							gap="6"
						>
							<Button
								kind="secondary"
								size="small"
								trackingId="CancelLeaveUpdatePlan"
								onClick={() => setShowConfirmCloseModal(false)}
							>
								Cancel
							</Button>
							<Button
								emphasis="high"
								trackingId="LeaveUpdatePlan"
								onClick={() => setStep(null)}
							>
								Leave without saving
							</Button>
						</Box>
					</Box>
				</Modal>
			) : null}
			<Form store={formStore}>
				<Box display="flex" flexDirection="column">
					<ProductCard
						productIcon={
							<IconSolidPlayCircle
								color={vars.theme.static.content.weak}
							/>
						}
						productType={ProductType.Sessions}
						rate={data?.billingDetails.plan.sessionsRate}
						retentionPeriod={formState.values.sessionsRetention}
						setRetentionPeriod={(rp) =>
							formStore.setValue(
								formStore.names.sessionsRetention,
								rp,
							)
						}
						enableBillingLimits={!!enableBillingLimits}
						limitCents={formState.values.sessionsLimitCents}
						setLimitCents={(l) => {
							formStore.setValue(
								formStore.names.sessionsLimitCents,
								l,
							)
							setHasChanges(true)
						}}
						setHasChanges={setHasChanges}
						usageAmount={sessionsUsage}
						predictedUsageAmount={predictedSessionsUsage}
						includedQuantity={includedSessions}
						planType={selectedPlanType}
						setStep={setStep}
					/>
					<Box borderBottom="divider" />
					<ProductCard
						productIcon={
							<IconSolidLightningBolt
								color={vars.theme.static.content.weak}
							/>
						}
						productType={ProductType.Errors}
						rate={data?.billingDetails.plan.errorsRate}
						retentionPeriod={formState.values.errorsRetention}
						setRetentionPeriod={(rp) =>
							formStore.setValue(
								formStore.names.errorsRetention,
								rp,
							)
						}
						enableBillingLimits={!!enableBillingLimits}
						limitCents={formState.values.errorsLimitCents}
						setLimitCents={(l) => {
							formStore.setValue(
								formStore.names.errorsLimitCents,
								l,
							)
							setHasChanges(true)
						}}
						setHasChanges={setHasChanges}
						usageAmount={errorsUsage}
						predictedUsageAmount={predictedErrorsUsage}
						includedQuantity={includedErrors}
						planType={selectedPlanType}
						setStep={setStep}
					/>
					<Box borderBottom="divider" />
					<ProductCard
						productIcon={
							<IconSolidLogs
								color={vars.theme.static.content.weak}
							/>
						}
						productType={ProductType.Logs}
						rate={data?.billingDetails.plan.logsRate}
						retentionPeriod={formState.values.logsRetention}
						setRetentionPeriod={(rp) =>
							formStore.setValue(
								formStore.names.logsRetention,
								rp,
							)
						}
						enableBillingLimits={!!enableBillingLimits}
						limitCents={formState.values.logsLimitCents}
						setLimitCents={(l) => {
							formStore.setValue(
								formStore.names.logsLimitCents,
								l,
							)
							setHasChanges(true)
						}}
						setHasChanges={setHasChanges}
						usageAmount={logsUsage}
						predictedUsageAmount={predictedLogsUsage}
						includedQuantity={includedLogs}
						planType={selectedPlanType}
						setStep={setStep}
					/>
					<Box borderBottom="divider" />
					<ProductCard
						productIcon={
							<IconSolidTraces
								color={vars.theme.static.content.weak}
							/>
						}
						productType={ProductType.Traces}
						rate={data?.billingDetails.plan.tracesRate}
						retentionPeriod={formState.values.tracesRetention}
						setRetentionPeriod={(rp) =>
							formStore.setValue(
								formStore.names.tracesRetention,
								rp,
							)
						}
						enableBillingLimits={!!enableBillingLimits}
						limitCents={formState.values.tracesLimitCents}
						setLimitCents={(l) => {
							formStore.setValue(
								formStore.names.tracesLimitCents,
								l,
							)
							setHasChanges(true)
						}}
						setHasChanges={setHasChanges}
						usageAmount={tracesUsage}
						predictedUsageAmount={predictedTracesUsage}
						includedQuantity={includedTraces}
						planType={selectedPlanType}
						setStep={setStep}
					/>
					<Box borderBottom="divider" />
					{selectedPlanType === PlanType.Free ? null : (
						<>
							<Box
								py="12"
								px="16"
								display="flex"
								alignItems="flex-start"
								gap="12"
								width="full"
							>
								<Box
									display="flex"
									alignItems="center"
									justifyContent="space-between"
									gap="8"
									width="full"
								>
									<Box
										display="flex"
										gap="4"
										alignItems="center"
									>
										<Text
											size="small"
											color="strong"
											weight="medium"
										>
											{selectedPlanType} base fee
										</Text>
									</Box>
									<Box>
										<Badge
											size="medium"
											shape="basic"
											variant="gray"
											label={baseAmountFormatted}
										></Badge>
									</Box>
								</Box>
							</Box>
							<Box borderBottom="divider" />
						</>
					)}
					<Stack gap="20" paddingTop="20" paddingBottom="16" px="16">
						<Box
							display="flex"
							justifyContent="space-between"
							gap="8"
							width="full"
						>
							<Box display="flex" alignItems="center" gap="12">
								<Text
									size="large"
									color="strong"
									weight="medium"
								>
									Estimated{' '}
									{data?.billingDetails.plan.interval ===
									'Annual'
										? 'Yearly'
										: 'Monthly'}{' '}
									Bill
								</Text>
								<Badge
									size="medium"
									shape="basic"
									variant="gray"
									label={`Due ${moment(
										nextBillingDate,
									).format('MM/DD/YY')}`}
								/>
							</Box>
							<Tooltip
								delayed
								trigger={
									<>
										<Text
											color="weak"
											size="large"
											weight="medium"
										>
											$
										</Text>
										<Text
											color="strong"
											size="large"
											weight="medium"
										>
											{predictedTotalFormatted}
										</Text>
									</>
								}
							>
								Estimated cost based on trailing 7 day usage.
								{discountCents ? (
									<>
										{' '}
										Includes a
										{discountPercent
											? ` ${discountPercent}% discount`
											: ''}
										{discountAmount
											? ` ${discountAmountFormatted} discount`
											: ''}
										.
									</>
								) : null}
							</Tooltip>
						</Box>
						<Box
							display="flex"
							justifyContent={
								isPaying ? 'space-between' : 'flex-end'
							}
							gap="12"
						>
							{isPaying ? (
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
									style={{
										border: vars.border.secondary,
									}}
								>
									Payment Settings
								</Button>
							) : null}
							<Button
								trackingId="UpdatePlanSave"
								onClick={() => {
									saveBillingPlan({
										variables: {
											workspace_id: workspace_id!,
											sessionsLimitCents:
												formState.values
													.sessionsLimitCents,
											sessionsRetention:
												formState.values
													.sessionsRetention,
											errorsLimitCents:
												formState.values
													.errorsLimitCents,
											errorsRetention:
												formState.values
													.errorsRetention,
											logsLimitCents:
												formState.values.logsLimitCents,
											logsRetention:
												formState.values.logsRetention,
											tracesLimitCents:
												formState.values
													.tracesLimitCents,
											tracesRetention:
												formState.values
													.tracesRetention,
										},
									})
										.then(() => {
											if (!isPaying) {
												createOrUpdateStripeSubscription(
													{
														variables: {
															workspace_id:
																workspace_id!,
														},
													},
												)
											} else {
												toast.success(
													'Billing plan saved!',
												)
												setHasChanges(false)
											}
										})
										.catch(() => {
											toast.error(
												'Failed to save billing plan details',
											)
										})
								}}
								disabled={billingPlanLoading || stripeLoading}
							>
								{isPaying
									? 'Save plan details'
									: 'Enter payment details'}
							</Button>
						</Box>
					</Stack>
				</Box>
			</Form>
		</Box>
	)
}

type Plan = {
	type: PlanType
	name: string
	descriptions: string[]
	icon: React.ReactNode
	price: number | '800+' | 'Custom'
}

const PLAN_BASE_FEES = {
	[PlanType.Free]: 0,
	[PlanType.UsageBased]: 0,
	[PlanType.Lite]: 50,
	[PlanType.Basic]: 150,
	[PlanType.Startup]: 400,
	[PlanType.Graduated]: 50,
} as const

const PLANS = {
	[PlanType.Free]: {
		type: PlanType.Free,
		name: 'Free',
		descriptions: ['Observability for individual developers'],
		icon: (
			<IconSolidReceiptTax
				size="24"
				color={vars.theme.static.content.weak}
			/>
		),
		price: 0,
	},
	[PlanType.Graduated]: {
		type: PlanType.Graduated,
		name: 'Developer',
		descriptions: [
			'Monitoring for your production application',
			'Flexible billing that scales as you grow',
		],
		icon: <IconSolidPuzzle size="24" color="#0090FF" />,
		price: 50,
	},
	[PlanType.Business]: {
		type: PlanType.Business,
		name: 'Business',
		descriptions: [
			'Unlimited projects, user seats, and dashboards',
			'Configurable spend limits and data retention',
			'Reporting and analytics for sessions and more',
			'MP4 video export for sessions',
		],
		icon: (
			<IconSolidOfficeBuilding
				size="24"
				color={vars.theme.static.content.default}
			/>
		),
		price: '800+',
	},
	[PlanType.Enterprise]: {
		type: PlanType.Enterprise,
		name: 'Enterprise',
		descriptions: [
			'Highly-available on-prem deployments',
			'Customized data storage and retention',
			'Robust availability for large-scale teams',
			'Support for SSO, RBAC, and other organizational requirements',
		],
		icon: <IconSolidServer size="24" color="#E93D82" />,
		price: 'Custom',
	},
} as { [plan in PlanType | 'Self-host']: Plan }

const FAQ = [
	{
		question: 'Do you offer discounts for non-profit organizations?',
		answer: 'We love supporting non-profits and offer a 75% discount for the lifetime of the account. To activate the discount, create a workplace on a paying plan. Then reach out to us over email requesting the discount.',
	},
	{
		question: 'Can I subscribe to a plan with a custom retention period?',
		answer: 'Yes, we support custom longer retention periods. The minimum options are shown when configuring your plan.',
	},
	{
		question: 'Should I use your Cloud product or self-host highlight?',
		answer: 'It is easier to get started with Highlight Cloud, and we have a generous monthly free tier. If you have complex data sovereignty requirements, you will likely need a self-hosted plan.',
	},
	{
		question: 'Can I migrate between Cloud and self-hosted Highlight?',
		answer: 'Yes, though it will require a conversation with us about the specifics. Reach out to us.',
	},
] as const

const PlanCard = ({
	plan,
	setSelectedPlanType,
	setStep,
	currentPlanType,
	howCanWeHelp,
	onClick,
}: {
	plan: Plan
	setSelectedPlanType: (step: PlanType) => void
	setStep: (step: PlanSelectStep) => void
	currentPlanType?: PlanType
	howCanWeHelp?: string
	onClick?: () => void
}) => {
	const { workspace_id } = useParams<{
		workspace_id: string
	}>()
	const current = plan.type === currentPlanType
	const enterprise =
		plan.type === PlanType.Business || plan.type === PlanType.Enterprise
	const free = plan.type === PlanType.Free
	return (
		<Stack
			p="12"
			paddingBottom="16"
			borderRadius="8"
			border="dividerWeak"
			boxShadow="small"
			width="full"
			gap="20"
		>
			{plan.icon}
			<Text size="large" weight="medium" color="strong">
				{plan.name}
			</Text>
			<h3 style={{ fontWeight: 700 }}>
				{plan.price === 'Custom' ? plan.price : `$${plan.price}`}
			</h3>
			{plan.price === 'Custom' ? null : (
				<Text
					size="xxSmall"
					color="weak"
					cssClass={style.priceSubtitle}
				>
					per month
				</Text>
			)}
			{enterprise ? (
				<CalendlyButton
					text="Talk to sales"
					howCanWeHelp={
						howCanWeHelp ??
						`I'd like to explore an enterprise plan.`
					}
					kind="secondary"
					size="small"
					emphasis="high"
					disabled={current}
					iconLeft={enterprise ? <IconSolidChatAlt /> : undefined}
					onClick={onClick}
				/>
			) : (
				<Button
					trackingId={`planSelect-${plan.name}`}
					kind="secondary"
					size="small"
					emphasis="high"
					disabled={current}
					onClick={() => {
						if (onClick) {
							onClick()
						}
						if (free) {
							window.open(
								getPlanChangeEmail({
									workspaceID: workspace_id,
									planType: plan.type,
								}),
							)
						} else if (isOnPrem) {
							window.open(
								'https://app.highlight.io/sign_up?ref=hobby',
							)
						} else {
							setSelectedPlanType(plan.type)
							setStep('Configure plan')
						}
					}}
				>
					{current ? 'Current plan' : 'Select plan'}
				</Button>
			)}
			<Stack>
				{plan.descriptions.map((d) => (
					<Box
						style={{
							display: 'grid',
							gap: 4,
							gridTemplateColumns: '14px 1fr',
							alignItems: 'center',
						}}
						key={d}
					>
						<IconSolidCheck size={14} />
						<Text size="small" weight="medium" color="default">
							{d}
						</Text>
					</Box>
				))}
			</Stack>
		</Stack>
	)
}

export const PlanComparisonPage: React.FC<{
	setSelectedPlanType: (plan: PlanType) => void
	setStep: (step: PlanSelectStep) => void
	title?: string
	description?: string
	enterprise?: true
	onClick?: () => void
	howCanWeHelp?: string
}> = ({
	setSelectedPlanType,
	setStep,
	title,
	description,
	enterprise,
	onClick,
	howCanWeHelp,
}) => {
	const { workspace_id } = useParams<{
		workspace_id: string
	}>()
	const { data } = useGetBillingDetailsQuery({
		variables: {
			workspace_id: workspace_id!,
		},
	})

	return (
		<Box height="full" margin="auto" p="12">
			<Stack gap="12">
				{title ? (
					<Callout title={title}>
						<Box mb="6">
							<Text size="small" color="moderate">
								Upgrade your plan to {description}
							</Text>
						</Box>
					</Callout>
				) : null}
				<Box
					display="flex"
					gap="12"
					alignItems="stretch"
					justifyContent="space-between"
					m="auto"
					style={{
						maxWidth: 960,
					}}
				>
					{Object.entries(PLANS)
						.filter(([name]) => !isOnPrem || name !== 'Free')
						.filter(
							([, plan]) =>
								!enterprise ||
								PLANS_WITH_ENTERPRISE_FEATURES.has(plan.type),
						)
						.map(([, plan]) => (
							<PlanCard
								currentPlanType={
									data?.billingDetails.plan.type ??
									PlanType.Free
								}
								plan={plan}
								setSelectedPlanType={setSelectedPlanType}
								setStep={setStep}
								key={plan.name}
								howCanWeHelp={howCanWeHelp}
								onClick={onClick}
							/>
						))}
				</Box>
				<Box
					display="flex"
					flexDirection="column"
					gap="12"
					mt="16"
					alignItems="stretch"
					justifyContent="space-between"
					m="auto"
					style={{
						maxWidth: 960,
					}}
				>
					<Text size="large" weight="bold" color="strong">
						FAQ
					</Text>
					<Box
						display="flex"
						flexDirection="column"
						border="dividerWeak"
						borderRadius="8"
					>
						{FAQ.map((faq, idx) => (
							<FAQEntry
								key={faq.question}
								faq={faq}
								bottomBorder={idx < FAQ.length - 1}
							/>
						))}
					</Box>
				</Box>
			</Stack>
		</Box>
	)
}

const FAQEntry = ({
	faq,
	bottomBorder,
}: {
	faq: { question: string; answer: string }
	bottomBorder?: boolean
}) => {
	const [expanded, setExpanded] = React.useState<boolean>(false)
	return (
		<Box
			key={faq.question}
			borderBottom={bottomBorder ? 'dividerWeak' : undefined}
			p="8"
		>
			<ReactCollapsible
				trigger={
					<Box
						key={faq.question}
						style={{
							display: 'grid',
							gap: 4,
							gridTemplateColumns: '16px 1fr',
							alignItems: 'center',
							...(expanded ? { marginBottom: 8 } : {}),
						}}
					>
						{expanded ? (
							<IconSolidCheveronDown
								size={16}
								color={
									vars.theme.interactive.fill.secondary
										.content.text
								}
							/>
						) : (
							<IconSolidCheveronRight
								size={16}
								color={
									vars.theme.interactive.fill.secondary
										.content.text
								}
							/>
						)}
						<Text>{faq.question}</Text>
					</Box>
				}
				open={expanded}
				handleTriggerClick={() => setExpanded(!expanded)}
				transitionTime={150}
			>
				<Box ml="20" py="4">
					<Text size="small" color="weak">
						{faq.answer}
					</Text>
				</Box>
			</ReactCollapsible>
		</Box>
	)
}

const UpdatePlanFooter: React.FC<{
	setStep: (step: PlanSelectStep) => void
}> = () => {
	const { allProjects } = useApplicationContext()
	const navigate = useNavigate()
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="space-between"
			gap="12"
			shadow="medium"
			style={{ maxWidth: 580 }}
			onClick={(e) => e.stopPropagation()}
		>
			<Stack
				border="secondary"
				borderRadius="8"
				backgroundColor="white"
				p="8"
				gap="8"
			>
				<Box>
					<Text color="weak">
						<b
							style={{
								color: vars.theme.static.content.strong,
							}}
						>
							Use our new filtering functionality
						</b>{' '}
						to drop data that is not relevant for your observability
						setup.
					</Text>
				</Box>
				<Box display="flex" alignItems="center" gap="8">
					<Button
						size="small"
						kind="secondary"
						emphasis="high"
						trackingId="UpdatePlan Filtering"
						onClick={() =>
							navigate(
								`/${allProjects?.at(0)?.id}/settings/filters`,
							)
						}
					>
						Go to filtering
					</Button>
					<TextLink
						color="none"
						href="https://www.highlight.io/docs/general/product-features/session-replay/filtering-sessions#set-up-ingestion-filters"
					>
						Learn more
					</TextLink>
				</Box>
			</Stack>
		</Box>
	)
}

export const UpdatePlanModal: React.FC<{
	step: PlanSelectStep
	setStep: (step: PlanSelectStep) => void
	currentPlanType: Exclude<PlanType, PlanType.Free>
}> = ({ step, setStep, currentPlanType }) => {
	const [selectedPlanType, setSelectedPlanType] =
		React.useState<PlanType>(currentPlanType)
	const [hasChanges, setHasChanges] = React.useState<boolean>(false)
	const [showConfirmCloseModal, setShowConfirmCloseModal] =
		React.useState<boolean>(false)
	React.useEffect(() => {
		if (step === null) {
			setHasChanges(false)
			setShowConfirmCloseModal(false)
		}
	}, [step])
	if (step === null) return null
	if (step === 'Custom Data Retention') {
		return (
			<EnterpriseFeatureButton
				setting="enable_business_retention"
				name="Custom Data Retention"
				key="Custom Data Retention"
				fn={async () => undefined}
				variant="basic"
				shown
			></EnterpriseFeatureButton>
		)
	}
	return (
		<Modal
			justifyContent="space-between"
			width={step === 'Select plan' ? 'full' : undefined}
			height="full"
			innerWidth="full"
			innerHeight={step === 'Select plan' ? 'full' : undefined}
			maxHeight="90vh"
			onClose={() => {
				if (
					step === 'Configure plan' &&
					hasChanges &&
					!showConfirmCloseModal
				) {
					setShowConfirmCloseModal(true)
				} else {
					setStep(null)
				}
			}}
			footer={
				step === 'Configure plan' ? (
					<UpdatePlanFooter setStep={setStep} />
				) : undefined
			}
			title={
				step === 'Select plan' ? 'Pricing Plans' : 'Edit current plan'
			}
		>
			{step === 'Select plan' ? (
				<PlanComparisonPage
					setSelectedPlanType={setSelectedPlanType}
					setStep={setStep}
				/>
			) : (
				<UpdatePlanPage
					selectedPlanType={selectedPlanType}
					setStep={setStep}
					setHasChanges={setHasChanges}
					showConfirmCloseModal={showConfirmCloseModal}
					setShowConfirmCloseModal={setShowConfirmCloseModal}
				/>
			)}
		</Modal>
	)
}

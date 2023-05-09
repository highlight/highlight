import { USD } from '@dinero.js/currencies'
import {
	Badge,
	Box,
	Form,
	Heading,
	IconProps,
	IconSolidArrowSmRight,
	IconSolidCheveronRight,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	IconSolidPlus,
	IconSolidX,
	Input,
	Tag,
	Text,
	useFormState,
} from '@highlight-run/ui'
import { message } from 'antd'
import { dinero, toDecimal } from 'dinero.js'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/Button'
import {
	useGetBillingDetailsQuery,
	useGetCustomerPortalUrlLazyQuery,
	useSaveBillingPlanMutation,
} from '@/graph/generated/hooks'
import { namedOperations } from '@/graph/generated/operations'
import { RetentionPeriod } from '@/graph/generated/schemas'
import { RETENTION_PERIOD_LABELS, tryCastDate } from '@/pages/Billing/Billing'
import { formatNumber, formatNumberWithDelimiters } from '@/util/numbers'
import { useParams } from '@/util/react-router/useParams'

import * as style from './UpdatePlanPage.css'

type ProductType = 'Sessions' | 'Errors' | 'Logs'

const RETENTION_OPTIONS: {
	readonly [k in ProductType]: readonly RetentionPeriod[]
} = {
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
}

const RETENTION_MULTIPLIER: { readonly [k in RetentionPeriod]: number } = {
	[RetentionPeriod.ThirtyDays]: 1,
	[RetentionPeriod.ThreeMonths]: 1,
	[RetentionPeriod.SixMonths]: 1.5,
	[RetentionPeriod.TwelveMonths]: 2,
	[RetentionPeriod.TwoYears]: 2.5,
}

const BASE_UNIT_COST_CENTS: { readonly [k in ProductType]: number } = {
	Sessions: 2000,
	Errors: 20,
	Logs: 150,
}

const UNIT_QUANTITY: { readonly [k in ProductType]: number } = {
	Sessions: 1_000,
	Errors: 1_000,
	Logs: 1_000_000,
}

const INCLUDED_QUANTITY: { readonly [k in ProductType]: number } = {
	Sessions: 500,
	Errors: 1_000,
	Logs: 1_000_000,
}

export const getCostCents = (
	productType: ProductType,
	retentionPeriod: RetentionPeriod,
	quantity: number,
): number => {
	const a = Math.floor(
		(BASE_UNIT_COST_CENTS[productType] *
			RETENTION_MULTIPLIER[retentionPeriod] *
			Math.max(quantity - INCLUDED_QUANTITY[productType], 0)) /
			UNIT_QUANTITY[productType],
	)
	return a
}

export const getQuantity = (
	productType: ProductType,
	retentionPeriod: RetentionPeriod,
	totalCents: number | undefined,
): number | undefined => {
	if (totalCents === undefined) {
		return undefined
	}

	return Math.floor(
		(totalCents * UNIT_QUANTITY[productType]) /
			(BASE_UNIT_COST_CENTS[productType] *
				RETENTION_MULTIPLIER[retentionPeriod]) +
			INCLUDED_QUANTITY[productType],
	)
}

export const getNextBillingDate = (
	nextInvoiceDate: Date | undefined,
	billingPeriodEnd: Date | undefined,
) => {
	if (nextInvoiceDate && billingPeriodEnd) {
		return nextInvoiceDate < billingPeriodEnd
			? nextInvoiceDate
			: billingPeriodEnd
	} else if (billingPeriodEnd) {
		return billingPeriodEnd
	} else {
		return moment().add(1, 'M').toDate()
	}
}

type ProductCardProps = {
	productIcon: React.ReactElement<IconProps>
	productType: ProductType
	retentionPeriod: RetentionPeriod
	setRetentionPeriod: (rp: RetentionPeriod) => void
	limitCents: number | undefined
	setLimitCents: (limit: number | undefined) => void
	predictedUsageAmount: number
}

interface UpdatePlanForm {
	sessionsRetention: RetentionPeriod
	sessionsLimitCents: number | undefined
	errorsRetention: RetentionPeriod
	errorsLimitCents: number | undefined
	logsRetention: RetentionPeriod
	logsLimitCents: number | undefined
}

type LimitButtonProps = Pick<
	ProductCardProps,
	'limitCents' | 'setLimitCents'
> & { defaultLimit: number }

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
						step=".01"
						value={limitCents / 100}
						onChange={(e) => {
							setLimitCents(
								Math.round(
									parseFloat(e.target.value ?? '0') * 100,
								),
							)
						}}
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
	retentionPeriod,
	setRetentionPeriod,
	limitCents,
	setLimitCents,
	predictedUsageAmount,
}: ProductCardProps) => {
	const unitCostCents =
		BASE_UNIT_COST_CENTS[productType] *
		RETENTION_MULTIPLIER[retentionPeriod]

	const unitQuantity = UNIT_QUANTITY[productType]
	const quantityFormatted = formatNumber(unitQuantity)

	const unitCostFormatted =
		'$' + toDecimal(dinero({ amount: unitCostCents, currency: USD }))

	const includedQuantity = INCLUDED_QUANTITY[productType]
	const netUsageAmount = Math.max(predictedUsageAmount - includedQuantity, 0)

	const predictedCostCents = getCostCents(
		productType,
		retentionPeriod,
		predictedUsageAmount,
	)

	const totalCostCents =
		limitCents !== undefined
			? Math.min(predictedCostCents, limitCents)
			: predictedCostCents

	const totalCostFormatted =
		'$' + toDecimal(dinero({ amount: totalCostCents, currency: USD }))

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
				<Box display="flex" gap="4">
					{productIcon}
					{productType}
				</Box>
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
										retentionPeriod === r ? 'high' : 'low'
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
				<Form.NamedSection label="Limit" name="Limit">
					<Box display="flex">
						<LimitButton
							limitCents={limitCents}
							setLimitCents={setLimitCents}
							defaultLimit={1.3 * predictedCostCents}
						/>
					</Box>
				</Form.NamedSection>
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
					>
						<Text>
							Price / {quantityFormatted} {productType}
						</Text>
						<Text>{unitCostFormatted}</Text>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
					>
						<Text>{productType}</Text>
						<Text>
							{formatNumberWithDelimiters(predictedUsageAmount)}
						</Text>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
					>
						<Text>- Included</Text>
						<Text>
							{formatNumberWithDelimiters(includedQuantity)}
						</Text>
					</Box>
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
					>
						<Text>= Net</Text>
						<Text>
							{formatNumberWithDelimiters(netUsageAmount)}
						</Text>
					</Box>
					<Box borderBottom="divider" />
					<Box
						display="flex"
						flexDirection="row"
						justifyContent="space-between"
					>
						<Text>Total</Text>
						<Text>{totalCostFormatted}</Text>
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

	const formState = useFormState<UpdatePlanForm>({
		defaultValues: {
			sessionsRetention: RetentionPeriod.ThreeMonths,
			sessionsLimitCents: undefined,
			errorsRetention: RetentionPeriod.ThreeMonths,
			errorsLimitCents: undefined,
			logsRetention: RetentionPeriod.ThirtyDays,
			logsLimitCents: undefined,
		},
	})

	const [saveBillingPlan] = useSaveBillingPlanMutation({
		refetchQueries: [namedOperations.Query.GetBillingDetails],
	})

	const { data, loading } = useGetBillingDetailsQuery({
		variables: {
			workspace_id: workspace_id!,
		},
		onCompleted: (data) => {
			formState.setValues({
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
			})
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
	const daysUntilNextBillingDate = Math.ceil(
		(nextBillingDate.getTime() - Date.now()) / (1000 * 3600 * 24),
	)

	const predictedSessionsUsage = Math.ceil(
		(data?.billingDetails.meter ?? 0) +
			daysUntilNextBillingDate *
				(data?.billingDetails.sessionsDailyAverage ?? 0),
	)
	let predictedSessionsCost = getCostCents(
		'Sessions',
		formState.values.sessionsRetention,
		predictedSessionsUsage,
	)
	if (formState.values.sessionsLimitCents !== undefined) {
		predictedSessionsCost = Math.min(
			predictedSessionsCost,
			formState.values.sessionsLimitCents,
		)
	}

	const predictedErrorsUsage = Math.ceil(
		(data?.billingDetails.errorsMeter ?? 0) +
			daysUntilNextBillingDate *
				(data?.billingDetails.errorsDailyAverage ?? 0),
	)
	let predictedErrorsCost = getCostCents(
		'Errors',
		formState.values.errorsRetention,
		predictedErrorsUsage,
	)
	if (formState.values.errorsLimitCents !== undefined) {
		predictedErrorsCost = Math.min(
			predictedErrorsCost,
			formState.values.errorsLimitCents,
		)
	}

	const predictedLogsUsage = Math.ceil(
		(data?.billingDetails.logsMeter ?? 0) +
			daysUntilNextBillingDate *
				(data?.billingDetails.logsDailyAverage ?? 0),
	)
	let predictedLogsCost = getCostCents(
		'Logs',
		formState.values.logsRetention,
		predictedLogsUsage,
	)
	if (formState.values.logsLimitCents !== undefined) {
		predictedLogsCost = Math.min(
			predictedLogsCost,
			formState.values.logsLimitCents,
		)
	}

	const predictedTotalCents =
		predictedSessionsCost + predictedErrorsCost + predictedLogsCost

	const predictedTotalFormatted =
		'$' + toDecimal(dinero({ amount: predictedTotalCents, currency: USD }))

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
			>
				<Button
					trackingId="UpdatePlanClose"
					kind="secondary"
					emphasis="low"
					onClick={() => {
						navigate('../billing-plans')
					}}
				>
					<IconSolidX />
				</Button>
				<Box display="flex" flexDirection="row" gap="6">
					<Button
						trackingId="UpdatePlanPaymentSettings"
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
							}).then(() => {
								message.success('Saved billing plan')
								navigate('../billing-plans')
							})
						}}
					>
						Save billing plan
					</Button>
				</Box>
			</Box>
			<Box display="flex" justifyContent="center">
				<Box
					px="8"
					cssClass={style.pageWrapper}
					display="flex"
					flexDirection="column"
					gap="12"
				>
					<Box display="flex" alignItems="center">
						<Tag
							kind="secondary"
							shape="basic"
							onClick={() => {
								navigate('../billing-plans')
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
					<Box>
						<Heading level="h4">Update plan details</Heading>
					</Box>
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
					<Form state={formState}>
						<Box display="flex" flexDirection="column" gap="16">
							<ProductCard
								productIcon={<IconSolidPlayCircle />}
								productType="Sessions"
								retentionPeriod={
									formState.values.sessionsRetention
								}
								setRetentionPeriod={(rp) =>
									formState.setValue(
										formState.names.sessionsRetention,
										rp,
									)
								}
								limitCents={formState.values.sessionsLimitCents}
								setLimitCents={(l) =>
									formState.setValue(
										formState.names.sessionsLimitCents,
										l,
									)
								}
								predictedUsageAmount={predictedSessionsUsage}
							/>
							<Box borderBottom="divider" />
							<ProductCard
								productIcon={<IconSolidLightningBolt />}
								productType="Errors"
								retentionPeriod={
									formState.values.errorsRetention
								}
								setRetentionPeriod={(rp) =>
									formState.setValue(
										formState.names.errorsRetention,
										rp,
									)
								}
								limitCents={formState.values.errorsLimitCents}
								setLimitCents={(l) =>
									formState.setValue(
										formState.names.errorsLimitCents,
										l,
									)
								}
								predictedUsageAmount={predictedErrorsUsage}
							/>
							<Box borderBottom="divider" />
							<ProductCard
								productIcon={<IconSolidLogs />}
								productType="Logs"
								retentionPeriod={formState.values.logsRetention}
								setRetentionPeriod={(rp) =>
									formState.setValue(
										formState.names.logsRetention,
										rp,
									)
								}
								limitCents={formState.values.logsLimitCents}
								setLimitCents={(l) =>
									formState.setValue(
										formState.names.logsLimitCents,
										l,
									)
								}
								predictedUsageAmount={predictedLogsUsage}
							/>
							<Box borderBottom="divider" />
							<Box
								display="flex"
								flexDirection="column"
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
										<Text>Total per month </Text>
										<Text>
											Due{' '}
											{moment(nextBillingDate).format(
												'MM/DD/YY',
											)}
										</Text>
									</Box>
									<Text>{predictedTotalFormatted}</Text>
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

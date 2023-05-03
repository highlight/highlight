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
	IconSolidX,
	Tag,
	Text,
	useFormState,
} from '@highlight-run/ui'
import { dinero, toDecimal } from 'dinero.js'

import { Button } from '@/components/Button'
import { RetentionPeriod } from '@/graph/generated/schemas'

import * as style from './UpdatePlanPage.css'

const RETENTION_MULTIPLIER = {
	[RetentionPeriod.ThirtyDays]: 1,
	[RetentionPeriod.ThreeMonths]: 1,
	[RetentionPeriod.SixMonths]: 1.5,
	[RetentionPeriod.TwelveMonths]: 2,
	[RetentionPeriod.TwoYears]: 2.5,
}

const BASE_UNIT_COST_CENTS = {
	Sessions: 2000,
	Errors: 20,
	Logging: 150,
}

const UNIT_QUANTITY = {
	Sessions: 1_000,
	Errors: 1_000,
	Logging: 1_000_000,
}

type ProductCardProps = {
	productIcon: React.ReactElement<IconProps>
	productType: 'Sessions' | 'Errors' | 'Logging'
	// unitCostCents: number
	// unitCostQuantity: number
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

const ProductCard = ({
	productIcon,
	productType,
	unitCostCents,
	unitCostQuantity,
	retentionPeriod,
	setRetentionPeriod,
	limitCents,
	setLimitCents,
	predictedUsageAmount,
}: ProductCardProps) => {
	const unitCostFormatted =
		'$' + toDecimal(dinero({ amount: unitCostCents, currency: USD }))
	const predictedCostCents =
		(predictedUsageAmount * unitCostCents) / unitCostQuantity
	const predictedCostFormatted =
		'$' + toDecimal(dinero({ amount: predictedCostCents, currency: USD }))
	const limitFormatted = billingLimitCents
		? '$' + toDecimal(dinero({ amount: billingLimitCents, currency: USD }))
		: undefined
	const usageRatio = billingLimitCents && costCents / billingLimitCents
	const isOverage = usageRatio ? usageRatio >= 1 : false

	return (
		<Box display="flex" flexDirection="row">
			<Box display="flex" flexDirection="column">
				<Box display="flex" gap="4">
					{productIcon}
					{productType}
				</Box>
				<Form.NamedSection
					label="Retention"
					name={form.names.excludedEnvironments}
				>
					Retention
				</Form.NamedSection>
				<Button></Button>
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

type BillingPageProps = {}

const UpdatePlanPage = ({}: BillingPageProps) => {
	const formState = useFormState<UpdatePlanForm>({})

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
				>
					<IconSolidX />
				</Button>
				<Box display="flex" flexDirection="row" gap="6">
					<Button
						trackingId="UpdatePlanPaymentSettings"
						kind="secondary"
						emphasis="low"
					>
						Payment settings
					</Button>
					<Button trackingId="UpdatePlanSave">
						Save billing plan
					</Button>
				</Box>
			</Box>
			<Box display="flex" justifyContent="center">
				<Box
					cssClass={style.pageWrapper}
					display="flex"
					flexDirection="column"
					gap="12"
				>
					<Box display="flex" alignItems="center">
						<Tag kind="secondary" shape="basic">
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
							spend?
							<Tag
								iconRight={<IconSolidArrowSmRight />}
								kind="primary"
								emphasis="low"
								shape="basic"
							>
								Reach out to sales
							</Tag>
						</Text>
					</Box>
					<ProductCard
						productIcon={<IconSolidPlayCircle />}
						productType="Sessions"
						unitCostCents={0}
						unitCostQuantity={0}
						retentionPeriod={formState.values.sessionsRetention}
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
						predictedUsageAmount={0}
					/>
					<ProductCard
						productIcon={<IconSolidLightningBolt />}
						productType="Errors"
						unitCostCents={0}
						unitCostQuantity={0}
						retentionPeriod={formState.values.sessionsRetention}
						setRetentionPeriod={(rp) =>
							formState.setValue(
								formState.names.errorsRetention,
								rp,
							)
						}
						limitCents={formState.values.sessionsLimitCents}
						setLimitCents={(l) =>
							formState.setValue(
								formState.names.errorsLimitCents,
								k,
							)
						}
						predictedUsageAmount={0}
					/>
					<ProductCard
						productIcon={<IconSolidLogs />}
						productType="Logging"
						unitCostCents={0}
						unitCostQuantity={0}
						retentionPeriod={formState.values.sessionsRetention}
						setRetentionPeriod={(rp) =>
							formState.setValue(
								formState.names.logsRetention,
								rp,
							)
						}
						limitCents={formState.values.sessionsLimitCents}
						setLimitCents={(l) =>
							formState.setValue(
								formState.names.logsLimitCents,
								l,
							)
						}
						predictedUsageAmount={0}
					/>
				</Box>
			</Box>
		</Box>
	)
}

export default UpdatePlanPage

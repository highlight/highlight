import { useAuthContext } from '@authentication/AuthContext'
import Progress from '@components/Progress/Progress'
import { Skeleton } from '@components/Skeleton/Skeleton'
import { USD } from '@dinero.js/currencies'
import {
	PlanType,
	ProductType,
	RetentionPeriod,
	SubscriptionDetails,
	SubscriptionInterval,
} from '@graph/schemas'
import { BILLING_PLANS } from '@pages/Billing/BillingPlanCard/BillingConfig'
import { getTrialEndDateMessage } from '@pages/Billing/utils/utils'
import { formatNumberWithDelimiters } from '@util/numbers'
import { Divider } from 'antd'
import {
	add,
	dinero,
	isZero,
	lessThan,
	multiply,
	subtract,
	toDecimal,
} from 'dinero.js'
import moment from 'moment'
import React from 'react'

import styles from './BillingStatusCard.module.scss'

const SESSIONS_CENTS_PER_THOUSAND = 500
const ERRORS_CENTS_PER_THOUSAND = 20
const LOGS_CENTS_PER_MILLION = 150
export const MEMBERS_PRICE = 20

const OverageProgress = ({
	product,
	count,
	limit,
}: {
	product: ProductType
	count: number
	limit: number
}) => {
	return (
		<>
			<span className={styles.subText}>
				You have used{' '}
				<strong>{formatNumberWithDelimiters(count)}</strong> of your{' '}
				<strong>{formatNumberWithDelimiters(limit)}</strong>{' '}
				{product.toLowerCase()}
			</span>
			<div className={styles.progressContainer}>
				<Progress
					numerator={count}
					denominator={limit || 1}
					showInfo={false}
				/>
			</div>
		</>
	)
}

export const BillingStatusCard = ({
	planType,
	sessionCount,
	sessionLimit,
	memberCount,
	memberLimit,
	errorsCount,
	errorsLimit,
	logsCount,
	logsLimit,
	subscriptionInterval,
	retentionPeriod,
	allowOverage,
	loading,
	billingPeriodEnd,
	nextInvoiceDate,
	subscriptionDetails: subscription_details,
	trialEndDate,
}: {
	planType: PlanType
	sessionCount: number
	sessionLimit: number
	memberCount: number
	memberLimit: number
	errorsCount: number
	errorsLimit: number
	logsCount: number
	logsLimit: number
	subscriptionInterval: SubscriptionInterval
	retentionPeriod: RetentionPeriod
	allowOverage: boolean
	loading: boolean
	billingPeriodEnd?: Date
	nextInvoiceDate?: Date
	subscriptionDetails: SubscriptionDetails | undefined
	trialEndDate?: Date
}) => {
	const { isHighlightAdmin } = useAuthContext()

	const baseAmount = dinero({
		amount: subscription_details?.baseAmount ?? 0,
		currency: USD,
	})

	const discountAmount = dinero({
		amount: subscription_details?.discountAmount ?? 0,
		currency: USD,
	})
	const discountPercent = subscription_details?.discountPercent
	const hasDiscount = !isZero(discountAmount) || !!discountPercent

	let sessionsOverage = sessionCount - sessionLimit
	if (!allowOverage || sessionsOverage < 0) {
		sessionsOverage = 0
	}

	let membersOverage = memberCount - memberLimit
	if (membersOverage < 0) {
		membersOverage = 0
	}
	if (!memberLimit) {
		membersOverage = 0
	}

	let errorsOverage = errorsCount - errorsLimit
	if (!allowOverage || errorsOverage < 0) {
		errorsOverage = 0
	}

	let logsOverage = logsCount - logsLimit
	if (!allowOverage || logsOverage < 0) {
		logsOverage = 0
	}

	const matchedPlan = BILLING_PLANS.find((p) => p.name === planType)

	const baseSubtotal =
		baseAmount ??
		dinero({
			amount:
				subscriptionInterval === SubscriptionInterval.Annual
					? (matchedPlan?.annualPrice ?? 0) * 12 * 100
					: (matchedPlan?.monthlyPrice ?? 0) * 100,
			currency: USD,
		})
	const membersSubtotal = dinero({
		amount: membersOverage * MEMBERS_PRICE * 100,
		currency: USD,
	})
	const overageSubtotal = dinero({
		amount:
			Math.ceil(sessionsOverage / 1000) * SESSIONS_CENTS_PER_THOUSAND +
			Math.ceil(errorsOverage / 1000) * ERRORS_CENTS_PER_THOUSAND +
			Math.ceil(logsOverage / 1_000_000) * LOGS_CENTS_PER_MILLION,
		currency: USD,
	})

	let total = add(membersSubtotal, overageSubtotal)
	if (
		nextInvoiceDate &&
		billingPeriodEnd &&
		!(nextInvoiceDate < billingPeriodEnd)
	) {
		total = add(total, baseSubtotal)
	}

	if (!isZero(discountAmount)) {
		total = subtract(total, discountAmount)
		const zero = dinero({ amount: 0, currency: USD })
		if (lessThan(total, zero)) {
			total = zero
		}
	}

	if (!!discountPercent) {
		total = multiply(total, { amount: 100 - discountPercent, scale: 2 })
	}

	let nextBillingDate: Date | undefined

	if (nextInvoiceDate && billingPeriodEnd) {
		nextBillingDate =
			nextInvoiceDate < billingPeriodEnd
				? nextInvoiceDate
				: billingPeriodEnd
	} else if (billingPeriodEnd) {
		nextBillingDate = billingPeriodEnd
	}

	let retentionStr: string
	switch (retentionPeriod) {
		case RetentionPeriod.ThreeMonths:
			retentionStr = '3 months'
			break
		case RetentionPeriod.SixMonths:
			retentionStr = '6 months'
			break
		case RetentionPeriod.TwelveMonths:
			retentionStr = '12 months'
			break
		case RetentionPeriod.TwoYears:
			retentionStr = '2 years'
			break
	}

	let planTypeStr: string
	switch (planType) {
		case PlanType.Free:
			planTypeStr = 'Free'
			break
		case PlanType.Lite:
			planTypeStr = 'Basic'
			break
		case PlanType.Basic:
			planTypeStr = 'Essentials'
			break
		case PlanType.Startup:
			planTypeStr = 'Startup'
			break
		case PlanType.Enterprise:
			planTypeStr = 'Enterprise'
			break
	}

	return (
		<div className={styles.fieldsBox}>
			<h3 className={styles.cardTitle}>
				Current Billing Status
				{nextBillingDate &&
					` - ${moment(nextBillingDate)
						.subtract(1, 'months')
						.format('MMM D')} to ${moment(nextBillingDate).format(
						'MMM D',
					)}`}
			</h3>
			<div className={styles.cardSubtitleContainer}>
				<span>Current Base Plan</span>
				{loading ? (
					<Skeleton width="45px" />
				) : (
					<span className={styles.subtotal}>
						${toDecimal(baseSubtotal)}
					</span>
				)}
			</div>
			<div className={styles.sectionContents}>
				{loading ? (
					<Skeleton count={2} />
				) : !!trialEndDate && new Date(trialEndDate) >= new Date() ? (
					<>
						<span className={styles.subText}>
							{getTrialEndDateMessage(trialEndDate)}
						</span>
					</>
				) : (
					<>
						<span className={styles.subText}>
							<span className={styles.planText}>
								{planTypeStr} Plan
							</span>{' '}
							(billed{' '}
							{subscriptionInterval ===
							SubscriptionInterval.Annual
								? 'annually'
								: 'monthly'}
							)
						</span>
						<br />
						<OverageProgress
							product={ProductType.Sessions}
							count={sessionCount}
							limit={sessionLimit}
						/>
						<OverageProgress
							product={ProductType.Errors}
							count={errorsCount}
							limit={errorsLimit}
						/>
						<OverageProgress
							product={ProductType.Logs}
							count={logsCount}
							limit={logsLimit}
						/>
					</>
				)}
			</div>
			{(loading || planType !== PlanType.Free) && isHighlightAdmin && (
				<>
					<Divider />
					<div className={styles.cardSubtitleContainer}>
						<span>Member Count</span>
						{loading ? (
							<Skeleton width="45px" />
						) : (
							<span className={styles.subtotal}>
								${toDecimal(membersSubtotal)}
							</span>
						)}
					</div>
					<div className={styles.sectionContents}>
						{loading ? (
							<Skeleton />
						) : (
							<span className={styles.subText}>
								Your workspace has{' '}
								<strong>
									{formatNumberWithDelimiters(memberCount)}
								</strong>{' '}
								members (
								<strong>
									{memberLimit > 0
										? formatNumberWithDelimiters(
												memberLimit,
										  )
										: 'unlimited'}
								</strong>{' '}
								are included with your plan).
							</span>
						)}
					</div>
					<Divider />
					<div className={styles.cardSubtitleContainer}>
						<span>Overage Status</span>
						{loading ? (
							<Skeleton width="45px" />
						) : (
							<span className={styles.subtotal}>
								${toDecimal(overageSubtotal)}
							</span>
						)}
					</div>
					<div className={styles.sectionContents}>
						{loading ? (
							<Skeleton />
						) : sessionsOverage > 0 ? (
							<span className={styles.subText}>
								You have a session overage of{' '}
								<strong>
									{formatNumberWithDelimiters(
										sessionsOverage,
									)}
								</strong>{' '}
								sessions ($5 per 1,000 sessions).
							</span>
						) : (
							<span className={styles.subText}>
								You're currently not paying session overage ($5
								per 1,000 sessions).
							</span>
						)}
						<br />
						{loading ? (
							<Skeleton />
						) : errorsOverage > 0 ? (
							<span className={styles.subText}>
								You have an errors overage of{' '}
								<strong>
									{formatNumberWithDelimiters(errorsOverage)}
								</strong>{' '}
								errors ($0.20 per 1,000 errors).
							</span>
						) : (
							<span className={styles.subText}>
								You're currently not paying errors overage
								($0.20 per 1,000 errors).
							</span>
						)}
						<br />
						{loading ? (
							<Skeleton />
						) : logsOverage > 0 ? (
							<span className={styles.subText}>
								You have a logs overage of{' '}
								<strong>
									{formatNumberWithDelimiters(logsOverage)}
								</strong>{' '}
								logs ($1.50 per 1,000,000 logs).
							</span>
						) : (
							<span className={styles.subText}>
								You're currently not paying logs overage ($1.50
								per 1,000,000 logs).
							</span>
						)}
					</div>
					<Divider />
					<div className={styles.cardSubtitleContainer}>
						<span>Retention</span>
					</div>
					<div className={styles.sectionContents}>
						{loading ? (
							<Skeleton />
						) : (
							<span className={styles.subText}>
								Sessions and errors will be retained for{' '}
								<strong>{retentionStr}</strong>.
							</span>
						)}
					</div>
					<Divider />
					<div className={styles.cardTotalRow}>
						{loading ? (
							<Skeleton width="120px" />
						) : hasDiscount ? (
							discountPercent !== 0 ? (
								<span>Discount: {discountPercent}% off</span>
							) : (
								<span>
									Discount: ${toDecimal(discountAmount)} off
								</span>
							)
						) : null}
						<span className={styles.cardTotalContainer}>
							{loading ? (
								<>
									<Skeleton width="120px" />
									<Skeleton width="45px" />
								</>
							) : (
								<>
									{nextBillingDate && (
										<span>
											Due{' '}
											{moment(nextBillingDate).format(
												'M/D/YY',
											)}
											:
										</span>
									)}
									<span className={styles.subtotal}>
										${toDecimal(total)}
									</span>
								</>
							)}
						</span>
					</div>
				</>
			)}
		</div>
	)
}

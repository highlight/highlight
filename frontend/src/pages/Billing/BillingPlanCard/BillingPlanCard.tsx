import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import { PlanType, RetentionPeriod, SubscriptionInterval } from '@graph/schemas'
import { MEMBERS_PRICE } from '@pages/Billing/BillingStatusCard/BillingStatusCard'
import { formatNumberWithDelimiters } from '@util/numbers'
import classNames from 'classnames'
import clsx from 'clsx'
import React from 'react'

import commonStyles from '../../../Common.module.scss'
import Button from '../../../components/Button/Button/Button'
import SvgVerifyCheckIcon from '../../../static/VerifyCheckIcon'
import { BillingPlan } from './BillingConfig'
import styles from './BillingPlanCard.module.scss'

const RETENTION_PERIOD_MULTIPLIER = {
	[RetentionPeriod.ThreeMonths]: 1,
	[RetentionPeriod.SixMonths]: 1.5,
	[RetentionPeriod.TwelveMonths]: 2,
	[RetentionPeriod.TwoYears]: 2.5,
}

export const BillingPlanCard = ({
	billingPlan,
	onSelect,
	current,
	loading,
	subscriptionInterval,
	retentionPeriod,
	disabled,
	memberCount,
	glowing,
}: {
	current: boolean
	billingPlan: BillingPlan
	onSelect: () => void
	loading: boolean
	subscriptionInterval: SubscriptionInterval
	retentionPeriod: RetentionPeriod
	disabled?: boolean
	memberCount: number
	glowing?: boolean
}) => {
	let membersOverage = 0
	if (!!billingPlan.membersIncluded) {
		membersOverage = memberCount - billingPlan.membersIncluded
	}
	const membersPrice = membersOverage * MEMBERS_PRICE

	let basePrice =
		subscriptionInterval === SubscriptionInterval.Annual
			? billingPlan.annualPrice
			: billingPlan.monthlyPrice

	basePrice *= RETENTION_PERIOD_MULTIPLIER[retentionPeriod]

	return (
		<div
			className={clsx(styles.billingPlanCard, {
				[styles.currentPlan]: current,
				[styles.glowingPlan]: glowing,
			})}
		>
			<h3 className={styles.billingPlanTitle}>{billingPlan.name}</h3>
			<div>
				<span
					className={classNames(
						commonStyles.title,
						styles.billingPlanPrice,
					)}
				>
					{`$${formatNumberWithDelimiters(basePrice)}`}
				</span>
				{billingPlan.type !== PlanType.Free && (
					<span>
						/mo, billed{' '}
						{subscriptionInterval === SubscriptionInterval.Annual
							? 'annually'
							: 'monthly'}
					</span>
				)}
			</div>
			<div className={styles.extraMembers}>
				{billingPlan.type === PlanType.Free ? null : membersOverage >
				  0 ? (
					<>
						<span className={styles.extraMembersCost}>
							+ ${membersPrice}
						</span>
						<span className={styles.extraMembersBreakdown}>
							(${MEMBERS_PRICE} x {membersOverage} seat
							{membersOverage > 1 ? 's' : ''}) monthly
						</span>
					</>
				) : (
					<>
						<span className={styles.extraMembersCost}>
							{billingPlan.membersIncluded || 'Unlimited'}
						</span>
						<span className={styles.extraMembersBreakdown}>
							{' '}
							members included
							{billingPlan.membersIncluded === undefined
								? '!'
								: ' for free'}
						</span>
					</>
				)}
			</div>
			<ul className={styles.advertisedFeaturesWrapper}>
				{billingPlan.advertisedFeatures.map((feature) => (
					<li
						className={styles.advertisedFeature}
						key={
							typeof feature === 'string' ? feature : feature.text
						}
					>
						<SvgVerifyCheckIcon
							className={styles.featureCheckIcon}
						/>
						{typeof feature === 'string' ? (
							feature
						) : (
							<span>
								{feature.text}
								<InfoTooltip
									title={
										feature.tooltip &&
										feature.tooltip(retentionPeriod)
									}
									size="medium"
								/>
							</span>
						)}
					</li>
				))}
			</ul>
			<Button
				trackingId="ChangeBillingPlan"
				disabled={current || disabled}
				onClick={onSelect}
				className={styles.button}
				loading={loading}
			>
				{current ? 'Current plan' : `Select ${billingPlan.name} Plan`}
			</Button>
		</div>
	)
}

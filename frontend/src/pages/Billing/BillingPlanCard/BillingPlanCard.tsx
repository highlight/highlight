import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import { PlanType, SubscriptionInterval } from '@graph/schemas'
import MessageIcon from '@icons/MessageIcon'
import { MEMBERS_PRICE } from '@pages/Billing/BillingStatusCard/BillingStatusCard'
import { formatNumberWithDelimiters } from '@util/numbers'
import clsx from 'clsx'
import React from 'react'

import commonStyles from '../../../Common.module.scss'
import Button from '../../../components/Button/Button/Button'
import SvgVerifyCheckIcon from '../../../static/VerifyCheckIcon'
import { BillingPlan } from './BillingConfig'
import styles from './BillingPlanCard.module.scss'

export const BillingPlanCard = ({
	billingPlan,
	onSelect,
	current,
	loading,
	subscriptionInterval,
	disabled,
	memberCount,
	glowing,
}: {
	current: boolean
	billingPlan: BillingPlan
	onSelect: () => void
	loading: boolean
	subscriptionInterval: SubscriptionInterval
	disabled?: boolean
	memberCount: number
	glowing?: boolean
}) => {
	let membersOverage = 0
	if (!!billingPlan.membersIncluded) {
		membersOverage = memberCount - billingPlan.membersIncluded
	}
	const membersPrice = membersOverage * MEMBERS_PRICE

	return (
		<div
			className={clsx(styles.billingPlanCard, {
				[styles.currentPlan]: current,
				[styles.glowingPlan]: glowing,
			})}
		>
			<h3 className={styles.billingPlanTitle}>{billingPlan.name}</h3>
			{billingPlan.type === PlanType.Enterprise ? (
				<div className={styles.enterpriseRow}>
					<span
						className={clsx(
							commonStyles.title,
							styles.billingPlanPrice,
						)}
					>
						<MessageIcon />
					</span>
					<span>reach out for more details</span>
				</div>
			) : (
				<div>
					<span
						className={clsx(
							commonStyles.title,
							styles.billingPlanPrice,
						)}
					>
						{`$${formatNumberWithDelimiters(
							subscriptionInterval === SubscriptionInterval.Annual
								? billingPlan.annualPrice
								: billingPlan.monthlyPrice,
						)}`}
					</span>
					{billingPlan.type !== PlanType.Free && (
						<span>
							/mo, billed{' '}
							{subscriptionInterval ===
							SubscriptionInterval.Annual
								? 'annually'
								: 'monthly'}
						</span>
					)}
				</div>
			)}
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
									title={feature.tooltip}
									size="medium"
								/>
							</span>
						)}
					</li>
				))}
			</ul>
			{billingPlan.type === PlanType.Enterprise ? (
				<ButtonLink
					trackingId="ChangeBillingPlan"
					disabled={disabled}
					className={styles.button}
					anchor
					href="mailto:sales@highlight.run"
					type="default"
					fullWidth
				>
					Contact Sales
				</ButtonLink>
			) : (
				<Button
					trackingId="ChangeBillingPlan"
					disabled={current || disabled}
					onClick={onSelect}
					className={styles.button}
					loading={loading}
				>
					{current
						? 'Current plan'
						: `Select ${billingPlan.name} Plan`}
				</Button>
			)}
		</div>
	)
}

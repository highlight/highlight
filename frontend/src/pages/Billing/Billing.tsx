import { useAuthContext } from '@authentication/AuthContext'
import Alert from '@components/Alert/Alert'
import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import { RadioGroup } from '@components/RadioGroup/RadioGroup'
import { USD } from '@dinero.js/currencies'
import {
	useCreateOrUpdateStripeSubscriptionMutation,
	useGetBillingDetailsQuery,
	useGetCustomerPortalUrlLazyQuery,
	useGetProjectQuery,
	useGetSubscriptionDetailsQuery,
	useUpdateBillingDetailsMutation,
} from '@graph/hooks'
import {
	AdminRole,
	Maybe,
	PlanType,
	RetentionPeriod,
	SubscriptionInterval,
} from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import BellRingingIcon from '@icons/BellRingingIcon'
import SvgLogInIcon from '@icons/LogInIcon'
import { BillingStatusCard } from '@pages/Billing/BillingStatusCard/BillingStatusCard'
import { useApplicationContext } from '@routers/ProjectRouter/context/ApplicationContext'
import { loadStripe } from '@stripe/stripe-js'
import analytics from '@util/analytics'
import {
	Authorization,
	useAuthorization,
} from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'
import { message } from 'antd'
import { dinero, toDecimal } from 'dinero.js'
import moment from 'moment'
import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import Skeleton from 'react-loading-skeleton'
import { useLocation, useMatch } from 'react-router-dom'
import { StringParam, useQueryParams } from 'use-query-params'

import { WorkspaceSettingsTab } from '@/hooks/useIsSettingsPath'

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss'
import styles from './Billing.module.scss'
import { BILLING_PLANS } from './BillingPlanCard/BillingConfig'
import { BillingPlanCard } from './BillingPlanCard/BillingPlanCard'
import { didUpgradePlan } from './utils/utils'

export const tryCastDate = (date: Maybe<string> | undefined) => {
	if (date) {
		return new Date(date)
	} else {
		return undefined
	}
}

const RETENTION_PERIODS = {
	'30 days': RetentionPeriod.ThirtyDays,
	'3 months': RetentionPeriod.ThreeMonths,
	'6 months': RetentionPeriod.SixMonths,
	'12 months': RetentionPeriod.TwelveMonths,
	'2 years': RetentionPeriod.TwoYears,
}

export const RETENTION_PERIOD_LABELS = {
	[RetentionPeriod.ThirtyDays]: '30 days',
	[RetentionPeriod.ThreeMonths]: '3 months',
	[RetentionPeriod.SixMonths]: '6 months',
	[RetentionPeriod.TwelveMonths]: '12 months',
	[RetentionPeriod.TwoYears]: '2 years',
}

export const useBillingHook = ({
	workspace_id,
	project_id,
}: {
	workspace_id?: string
	project_id?: string
}) => {
	const { isAuthLoading, isLoggedIn } = useAuthContext()
	const { data: projectData } = useGetProjectQuery({
		variables: { id: project_id || '' },
		skip: !project_id?.length || !!workspace_id?.length,
	})

	const {
		loading: subscriptionLoading,
		data: subscriptionData,
		refetch: refetchSubscription,
	} = useGetSubscriptionDetailsQuery({
		variables: {
			workspace_id: workspace_id || projectData?.workspace?.id || '',
		},
		skip:
			isAuthLoading ||
			!isLoggedIn ||
			(!workspace_id?.length && !projectData?.workspace?.id),
	})

	return {
		loading: subscriptionLoading,
		subscriptionData: subscriptionData,
		refetchSubscription: refetchSubscription,
		issues:
			!subscriptionLoading &&
			subscriptionData?.subscription_details.lastInvoice?.status
				?.length &&
			!['paid', 'void', 'draft'].includes(
				subscriptionData.subscription_details.lastInvoice.status,
			),
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

const BillingPage = () => {
	const workspaceMatch = useMatch('/w/:workspace_id/:page_id')
	const workspaceId = workspaceMatch?.params.workspace_id
	const pageId = workspaceMatch?.params.page_id as WorkspaceSettingsTab

	const [{ tier }] = useQueryParams({
		tier: StringParam,
	})
	const { pathname } = useLocation()
	const { currentWorkspace } = useApplicationContext()
	const { checkPolicyAccess } = useAuthorization()
	const [checkoutRedirectFailedMessage, setCheckoutRedirectFailedMessage] =
		useState<string>('')
	const [loadingPlanType, setLoadingPlanType] = useState<PlanType | null>(
		null,
	)
	const [rainConfetti, setRainConfetti] = useState(false)
	const [subscriptionInterval, setSubscriptionInterval] = useState(
		SubscriptionInterval.Monthly,
	)
	const [retentionPeriod, setRetentionPeriod] = useState(
		RetentionPeriod.ThreeMonths,
	)

	const {
		loading: billingLoading,
		error: billingError,
		data: billingData,
		refetch,
	} = useGetBillingDetailsQuery({
		variables: {
			workspace_id: workspaceId!,
		},
		skip: !workspaceId,
		onCompleted: (data) => {
			if (data?.billingDetails?.plan?.interval !== undefined) {
				setSubscriptionInterval(data.billingDetails.plan.interval)
			}
			if (data?.workspace?.retention_period) {
				setRetentionPeriod(data?.workspace?.retention_period)
			}
		},
	})

	const {
		loading: subscriptionLoading,
		issues: subscriptionIssues,
		subscriptionData,
		refetchSubscription,
	} = useBillingHook({ workspace_id: workspaceId })

	const [createOrUpdateStripeSubscription, { data }] =
		useCreateOrUpdateStripeSubscriptionMutation({ fetchPolicy: 'no-cache' })

	const [updateBillingDetails] = useUpdateBillingDetailsMutation()

	const [getCustomerPortalUrl, { loading: loadingCustomerPortal }] =
		useGetCustomerPortalUrlLazyQuery({
			onCompleted: (data) => {
				if (data?.customer_portal_url) {
					window.open(data?.customer_portal_url, '_self')
				}
			},
		})

	const [isCancel, setIsCancel] = useState(false)

	useEffect(() => {
		const response = pathname.split('/')[4] ?? ''
		if (response === 'success') {
			updateBillingDetails({
				variables: { workspace_id: workspaceId! },
			}).then(() => {
				message.success('Billing change applied!', 5)
				refetch()
				refetchSubscription()
			})
		}
		if (checkoutRedirectFailedMessage) {
			message.error(checkoutRedirectFailedMessage, 5)
		}
		if (billingError) {
			message.error(billingError.message, 5)
		}
	}, [
		pathname,
		checkoutRedirectFailedMessage,
		billingError,
		updateBillingDetails,
		refetch,
		refetchSubscription,
		workspaceId,
	])

	const createOnSelect = (newPlan: PlanType) => {
		return async () => {
			setLoadingPlanType(newPlan)
			createOrUpdateStripeSubscription({
				variables: {
					workspace_id: workspaceId!,
					plan_type: newPlan,
					interval: subscriptionInterval,
					retention_period: retentionPeriod,
				},
			}).then((r) => {
				if (!r.data?.createOrUpdateStripeSubscription) {
					updateBillingDetails({
						variables: { workspace_id: workspaceId! },
					}).then(() => {
						const previousPlan =
							billingData!.billingDetails!.plan.type
						const upgradedPlan = didUpgradePlan(
							previousPlan,
							newPlan,
						)

						analytics.track('Billing plan change', {
							newPlan,
							previousPlan,
						})

						if (upgradedPlan) {
							setRainConfetti(true)
							message.success(
								'Thanks for upgrading your plan!',
								10,
							)
						} else {
							setRainConfetti(false)
							message.success('Billing change applied!', 5)
							analytics.track('Plan changed', { newPlan })
						}
						refetch().then(() => {
							setLoadingPlanType(null)
						})
						refetchSubscription()
					})
				}
			})
		}
	}

	if (data?.createOrUpdateStripeSubscription && stripePromiseOrNull) {
		;(async function () {
			const stripe = await stripePromiseOrNull
			const result = stripe
				? await stripe.redirectToCheckout({
						sessionId: data.createOrUpdateStripeSubscription ?? '',
				  })
				: { error: 'Error: could not load stripe client.' }

			if (result.error) {
				// result.error is either a string message or a StripeError,
				// which contains a message localized for the user.
				setCheckoutRedirectFailedMessage(
					typeof result.error === 'string'
						? result.error
						: typeof result.error.message === 'string'
						? result.error.message
						: 'Redirect to checkout failed. This is most likely a network or browser error.',
				)
			}
		})()
	}

	const allowOverage = billingData?.workspace?.allow_meter_overage ?? true

	const outstandingAmount = dinero({
		amount:
			subscriptionData?.subscription_details?.lastInvoice?.amountDue ?? 0,
		currency: USD,
	})
	const currentUnlimitedMembers =
		billingData?.billingDetails?.plan.membersLimit === null

	const BillingDetails = () => (
		<>
			<div className={styles.titleContainer}>
				<div>
					<h3>Billing</h3>
					<p className={layoutStyles.subTitle}>
						View or edit your workspace's billing settings.
					</p>
				</div>
				<Authorization allowedRoles={[AdminRole.Admin]}>
					<div className={styles.portalButtonContainer}>
						<Button
							trackingId="RedirectToCustomerPortal"
							type="default"
							onClick={() => {
								setIsCancel(false)
								getCustomerPortalUrl({
									variables: {
										workspace_id: workspaceId!,
									},
								})
							}}
							loading={loadingCustomerPortal && !isCancel}
							className={styles.portalButton}
						>
							<SvgLogInIcon className={styles.portalButtonIcon} />{' '}
							Payment Settings
						</Button>
						<Button
							trackingId="CancelRedirectToCustomerPortal"
							type="primary"
							danger
							onClick={() => {
								setIsCancel(true)
								getCustomerPortalUrl({
									variables: {
										workspace_id: workspaceId!,
									},
								})
							}}
							loading={loadingCustomerPortal && isCancel}
							className={styles.portalButton}
						>
							<SvgLogInIcon className={styles.portalButtonIcon} />{' '}
							Cancel Subscription
						</Button>
					</div>
				</Authorization>
			</div>
			<BillingStatusCard
				planType={
					billingData?.billingDetails.plan.type ?? PlanType.Free
				}
				sessionCount={billingData?.billingDetails.meter ?? 0}
				sessionLimit={billingData?.billingDetails.plan.quota ?? 0}
				memberCount={billingData?.billingDetails.membersMeter ?? 0}
				memberLimit={billingData?.billingDetails.plan.membersLimit ?? 0}
				errorsCount={billingData?.billingDetails.errorsMeter ?? 0}
				errorsLimit={billingData?.billingDetails.plan.errorsLimit ?? 0}
				logsCount={billingData?.billingDetails.logsMeter ?? 0}
				logsLimit={billingData?.billingDetails.plan.logsLimit ?? 0}
				subscriptionInterval={
					billingData?.billingDetails.plan.interval ??
					SubscriptionInterval.Monthly
				}
				retentionPeriod={
					billingData?.workspace?.retention_period ??
					RetentionPeriod.SixMonths
				}
				billingPeriodEnd={tryCastDate(
					billingData?.workspace?.billing_period_end,
				)}
				nextInvoiceDate={tryCastDate(
					billingData?.workspace?.next_invoice_date,
				)}
				allowOverage={allowOverage}
				loading={billingLoading || subscriptionLoading}
				subscriptionDetails={subscriptionData?.subscription_details}
				trialEndDate={tryCastDate(
					billingData?.workspace?.trial_end_date,
				)}
			/>
		</>
	)

	const BillingUpgrade = () => (
		<>
			{!currentUnlimitedMembers &&
			billingData?.billingDetails.plan.type &&
			billingData.billingDetails.plan.type !== PlanType.Free ? (
				<Authorization allowedRoles={[AdminRole.Admin]}>
					<Card className={styles.unlimitedMembersCard}>
						<div className={styles.unlimitedMembersContainer}>
							<div className={styles.unlimitedMembersIcon}>
								<BellRingingIcon />
							</div>
							<div>
								<span className={styles.unlimitedMembersHeader}>
									You're currently on a custom plan.
								</span>
								<br />
								Our new plans don't charge based on seats in
								your workspace.
								<br />
								If you'd like to upgrade, pick one of the new
								plans or{' '}
								<a
									className={styles.contact}
									href="mailto:sales@highlight.run"
									type="default"
								>
									contact us.
								</a>
							</div>
						</div>
					</Card>
				</Authorization>
			) : null}
			<Authorization allowedRoles={[AdminRole.Admin]}>
				<div className={styles.toggleControls}>
					<div className={styles.annualToggleBox}>
						<label>
							<span className={styles.annualToggleText}>
								Billing Interval
							</span>
							<div>Annual plans have a 20% discount.</div>
							<RadioGroup
								style={{ marginTop: 20, marginBottom: 20 }}
								selectedLabel={subscriptionInterval}
								labels={[
									SubscriptionInterval.Monthly,
									SubscriptionInterval.Annual,
								]}
								onSelect={(p) => {
									setSubscriptionInterval(p)
								}}
							/>
						</label>
					</div>
					<div className={styles.retentionPeriodBox}>
						<label>
							<span className={styles.annualToggleText}>
								Retention
							</span>
							<div>
								Choose your retention for sessions and errors.
								<br />
								Logs are retained for 30 days.
							</div>
							<RadioGroup
								style={{ marginTop: 20, marginBottom: 20 }}
								selectedLabel={
									RETENTION_PERIOD_LABELS[retentionPeriod]
								}
								labels={[
									'3 months',
									'6 months',
									'12 months',
									'2 years',
								]}
								onSelect={(p) => {
									if (
										p === '3 months' ||
										p === '6 months' ||
										p === '12 months' ||
										p === '2 years'
									) {
										setRetentionPeriod(RETENTION_PERIODS[p])
									}
								}}
							/>
						</label>
					</div>
					<div className={styles.contactSalesBox}>
						<label>
							<span className={styles.annualToggleText}>
								Contact Sales
							</span>
							<div>
								If you have questions about the plans listed
								here, or you're expecting to have a high usage
								volume, you can{' '}
								<a
									className={styles.contact}
									href="mailto:sales@highlight.run"
									type="default"
								>
									reach out to us
								</a>
								.
							</div>
						</label>
					</div>
				</div>
			</Authorization>
			<div className={styles.billingPlanCardWrapper}>
				<Authorization
					allowedRoles={[AdminRole.Admin]}
					forbiddenFallback={
						<Alert
							trackingId="AdminNoAccessToBilling"
							type="info"
							message="You don't have access to billing."
							description={
								`You don't have permission to access ` +
								`the billing details for "${currentWorkspace?.name}". ` +
								`Please contact a workspace admin to make changes.`
							}
						/>
					}
				>
					{BILLING_PLANS.map((billingPlan) =>
						billingLoading ? (
							<Skeleton
								key={billingPlan.type}
								style={{ borderRadius: 8 }}
								count={1}
								height={325}
								width={275}
							/>
						) : (
							<BillingPlanCard
								disabled={
									!checkPolicyAccess({
										policyName: POLICY_NAMES.BillingUpdate,
									})
								}
								glowing={billingPlan.type === tier}
								key={billingPlan.type}
								current={
									billingData?.billingDetails.plan
										.membersLimit === null &&
									billingData?.billingDetails.plan.type ===
										billingPlan.type &&
									(billingPlan.type === PlanType.Free ||
										billingData?.billingDetails.plan
											.interval ===
											subscriptionInterval) &&
									retentionPeriod ===
										billingData?.workspace?.retention_period
								}
								billingPlan={billingPlan}
								onSelect={createOnSelect(billingPlan.type)}
								loading={loadingPlanType === billingPlan.type}
								subscriptionInterval={subscriptionInterval}
								retentionPeriod={retentionPeriod}
								memberCount={
									billingData?.billingDetails.membersMeter ??
									0
								}
							/>
						),
					)}
				</Authorization>
			</div>
		</>
	)

	return (
		<Box>
			<Box style={{ maxWidth: 1000 }} my="40" mx="auto">
				{rainConfetti && <Confetti recycle={false} />}
				{subscriptionIssues && (
					<Card
						className={styles.invoiceFailedCard}
						style={{ marginBottom: 0, marginTop: 24 }}
					>
						<div className={styles.invoiceFailedContainer}>
							<div className={styles.invoiceFailedBell}>
								<BellRingingIcon />
							</div>
							<div>
								<span className={styles.invoiceFailedHeader}>
									Your last invoice failed to process!
								</span>
								<br />
								<span>${toDecimal(outstandingAmount)}</span> is
								past due as of{' '}
								{moment(
									subscriptionData?.subscription_details
										?.lastInvoice?.date,
								).format('M/D/YY')}
								. Please add a payment method to maintain the
								subscription.
								<Authorization allowedRoles={[AdminRole.Admin]}>
									<Button
										trackingId="UpdateFailedInvoice"
										onClick={() => {
											window.open(
												subscriptionData
													?.subscription_details
													?.lastInvoice?.url || '',
												'_self',
											)
										}}
										loading={
											loadingCustomerPortal && !isCancel
										}
										className={
											styles.invoiceFailedUpdatePayment
										}
									>
										Update Payment
									</Button>
								</Authorization>
							</div>
						</div>
					</Card>
				)}
				{pageId === 'current-plan' ? (
					<BillingDetails />
				) : pageId === 'upgrade-plan' ? (
					<BillingUpgrade />
				) : null}
			</Box>
		</Box>
	)
}

export default BillingPage

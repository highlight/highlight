import { DEMO_WORKSPACE_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import PopConfirm from '@components/PopConfirm/PopConfirm'
import { useGetAdminQuery, useGetOnboardingStepsQuery } from '@graph/hooks'
import SvgCloseIcon from '@icons/CloseIcon'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { useHistory } from 'react-router'
import useSessionStorage from 'react-use/lib/useSessionStorage'

import { ReactComponent as CheckIcon } from '../../static/verify-check-icon.svg'
import Button from '../Button/Button/Button'
import PillButton from '../Button/PillButton/PillButton'
import InfoTooltip from '../InfoTooltip/InfoTooltip'
import Popover from '../Popover/Popover'
import Progress from '../Progress/Progress'
import styles from './OnboardingBubble.module.scss'

interface OnboardingStep {
	displayName: string
	action: () => void
	completed: boolean
	tooltip?: string
}

const OnboardingBubble = () => {
	const history = useHistory()
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [, setHasFinishedOnboarding] = useLocalStorage(
		`highlight-finished-onboarding-${project_id}`,
		false,
	)
	const [hasStartedOnboarding] = useLocalStorage(
		`highlight-started-onboarding-${project_id}`,
		false,
	)
	const [
		temporarilyHideOnboardingBubble,
		setTemporarilyHideOnboardingBubble,
	] = useSessionStorage('highlightTemporarilyHideOnboardingBubble', false)
	const [
		permanentlyHideOnboardingBubble,
		setPermanentlyHideOnboardingBubble,
	] = useLocalStorage(
		`highlightPermanentlyHideOnboardingBubble-${project_id}`,
		false,
	)
	const [steps, setSteps] = useState<OnboardingStep[]>([])
	const [rainConfetti, setRainConfetti] = useState(false)
	const [stepsNotFinishedCount, setStepsNotFinishedCount] =
		useState<number>(-1)
	const { data: admin_data } = useGetAdminQuery({ skip: false })
	const { loading, startPolling, stopPolling, data } =
		useGetOnboardingStepsQuery({
			variables: {
				project_id,
				admin_id: (admin_data?.admin?.id as string) || '',
			},
			fetchPolicy: 'network-only',
			skip:
				temporarilyHideOnboardingBubble ||
				permanentlyHideOnboardingBubble,
		})

	useEffect(() => {
		if (data?.isIntegrated && data?.workspace?.id) {
			window.Intercom('update', {
				company: {
					id: data.workspace.id,
					is_integrated: data.isIntegrated,
				},
			})
		}
	}, [data])

	useEffect(() => {
		if (data) {
			const STEPS: OnboardingStep[] = []
			STEPS.push({
				displayName: 'Install the Highlight SDK',
				action: () => {
					history.push(`/${project_id}/setup`)
				},
				completed: data.isIntegrated || false,
			})
			STEPS.push({
				displayName: 'Configure Alerts',
				action: () => {
					history.push(`/${project_id}/alerts`)
				},
				completed: !!data.workspace?.slack_channels,
			})
			STEPS.push({
				displayName: 'Invite your team',
				action: () => {
					history.push(`/w/${data.workspace?.id}/team`)
				},
				completed: (data.admins?.length || 0) > 1,
			})
			STEPS.push({
				displayName: 'View your first session',
				action: () => {
					history.push(`/${project_id}/sessions`)
				},
				completed: !!data.projectHasViewedASession || false,
			})
			STEPS.push({
				displayName: 'Create your first comment',
				action: () => {
					if (data.projectHasViewedASession?.secure_id !== '') {
						history.push(
							`/${project_id}/sessions/${data.projectHasViewedASession?.secure_id}`,
						)
					} else {
						history.push(`/${project_id}/sessions`)
					}
				},
				completed: !!data.adminHasCreatedComment || false,
				tooltip: `You can create a comment on a session by clicking on the session player. You can also tag your team by @'ing them.`,
			})
			setSteps(STEPS)
			const stepsNotFinishedCount = STEPS.reduce((prev, curr) => {
				if (!curr.completed) {
					return prev + 1
				}
				return prev
			}, 0)

			setStepsNotFinishedCount(stepsNotFinishedCount)

			// Don't show the onboarding bubble if all the steps are completed.
			if (stepsNotFinishedCount === 0) {
				if (hasStartedOnboarding) {
					setRainConfetti(true)
					message.success('You have finished onboarding 👏')
					setTimeout(() => {
						setHasFinishedOnboarding(true)
					}, 1000 * 10)
				} else {
					setHasFinishedOnboarding(true)
				}
				stopPolling()
			} else if (stepsNotFinishedCount !== -1) {
				startPolling(3000)
			}
		}

		return () => {
			stopPolling()
		}
	}, [
		data,
		hasStartedOnboarding,
		history,
		project_id,
		setHasFinishedOnboarding,
		startPolling,
		stopPolling,
	])

	if (rainConfetti) {
		return <Confetti recycle={false} />
	}

	if (
		loading ||
		stepsNotFinishedCount === -1 ||
		temporarilyHideOnboardingBubble ||
		permanentlyHideOnboardingBubble ||
		project_id === DEMO_WORKSPACE_APPLICATION_ID
	) {
		return null
	}

	return (
		<div className={classNames(styles.container)}>
			<Popover
				align={{ offset: [0, -24] }}
				placement="topLeft"
				trigger={['click']}
				onVisibleChange={(visible) => {
					if (visible) {
						analytics.track('Viewed onboarding bubble')
					}
				}}
				popoverClassName={styles.popover}
				content={
					<>
						<div className={styles.onboardingBubblePopoverHeader}>
							<div>
								<h2>Account setup</h2>
								<p>You're almost done setting up Highlight.</p>

								<Progress
									numerator={
										steps.length - stepsNotFinishedCount
									}
									denominator={steps.length}
									showInfo
								/>
							</div>
							<PopConfirm
								title="Show setup steps later?"
								description="Completing these setup steps will help you get the most out of Highlight."
								cancelText="Don't Show Again"
								okText="Show Again"
								placement="topLeft"
								align={{ offset: [-8, -12] }}
								onConfirm={() => {
									setTemporarilyHideOnboardingBubble(true)
								}}
								onCancel={() => {
									setPermanentlyHideOnboardingBubble(true)
								}}
							>
								<Button
									trackingId="hideOnboardingBubble"
									type="text"
									iconButton
									small
									className={styles.closeButton}
								>
									<SvgCloseIcon />
								</Button>
							</PopConfirm>
						</div>
						<ul className={styles.stepsContainer}>
							{steps.map((step) => (
								<li key={step.displayName}>
									<Button
										trackingId="OpenOnboardingBubble"
										onClick={step.action}
										type="text"
										className={classNames(
											step.completed
												? styles.stepCompleted
												: styles.stepIncomplete,
										)}
									>
										<div
											className={classNames(
												styles.checkWrapper,
												{
													[styles.checkWrapperCompleted]:
														step.completed,
												},
											)}
										>
											<CheckIcon
												className={classNames(
													styles.checkIcon,
												)}
											/>
										</div>
										{step.displayName}
										{step.tooltip && (
											<InfoTooltip
												placement="topRight"
												align={{ offset: [12, 0] }}
												title={step.tooltip}
												className={styles.tooltip}
											/>
										)}
									</Button>
								</li>
							))}
						</ul>
					</>
				}
			>
				<PillButton type="primary" className={styles.button}>
					<div className={styles.stepsCount}>
						{stepsNotFinishedCount}
					</div>
					Highlight Setup
				</PillButton>
			</Popover>
		</div>
	)
}

export default OnboardingBubble

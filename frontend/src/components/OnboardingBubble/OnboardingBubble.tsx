import useLocalStorage from '@rehooks/local-storage';
import { message } from 'antd';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';
import {
    useGetAdminQuery,
    useGetOnboardingStepsQuery,
} from '../../graph/generated/hooks';
import SvgCircleCheckIcon from '../../static/CircleCheckIcon';
import Button from '../Button/Button/Button';
import PillButton from '../Button/PillButton/PillButton';
import Popover from '../Popover/Popover';
import Progress from '../Progress/Progress';
import Tooltip from '../Tooltip/Tooltip';
import styles from './OnboardingBubble.module.scss';

interface OnboardingStep {
    displayName: string;
    action: () => void;
    completed: boolean;
    tooltip?: string;
}

const OnboardingBubble = () => {
    const history = useHistory();
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const [, setHasFinishedOnboarding] = useLocalStorage(
        `highlight-finished-onboarding-${organization_id}`,
        false
    );
    const [steps, setSteps] = useState<OnboardingStep[]>([]);
    const [rainConfetti, setRainConfetti] = useState(false);
    const [stepsNotFinishedCount, setStepsNotFinishedCount] = useState<number>(
        -1
    );
    const { data: admin_data } = useGetAdminQuery({ skip: false });
    const {
        loading,
        startPolling,
        stopPolling,
        called,
        data,
    } = useGetOnboardingStepsQuery({
        variables: {
            organization_id,
            admin_id: (admin_data?.admin?.id as string) || '',
        },
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        if (data) {
            const STEPS: OnboardingStep[] = [];
            STEPS.push({
                displayName: 'Install the Highlight SDK',
                action: () => {
                    history.push(`/${organization_id}/setup`);
                },
                completed: data.isIntegrated || false,
            });
            STEPS.push({
                displayName: 'Integrate with Slack',
                action: () => {
                    history.push(`/${organization_id}/setup`);
                },
                completed: !!data.organization?.slack_webhook_channel,
            });
            STEPS.push({
                displayName: 'Invite your team',
                action: () => {
                    history.push(`/${organization_id}/team`);
                },
                completed: (data.admins?.length || 0) > 1,
            });
            STEPS.push({
                displayName: 'View your first session',
                action: () => {
                    history.push(`/${organization_id}/sessions`);
                },
                completed: !!data.organizationHasViewedASession || false,
            });
            STEPS.push({
                displayName: 'Create your first comment',
                action: () => {
                    if (data.organizationHasViewedASession?.id !== '0') {
                        history.push(
                            `/${organization_id}/sessions/${data.organizationHasViewedASession?.id}`
                        );
                    } else {
                        history.push(`/${organization_id}/sessions`);
                    }
                },
                completed: !!data.adminHasCreatedComment || false,
                tooltip: `You can create a comment on a session by clicking on the session player. You can also tag your team by @'ing them.`,
            });
            setSteps(STEPS);
            const stepsNotFinishedCount = STEPS.reduce((prev, curr) => {
                if (!curr.completed) {
                    return prev + 1;
                }
                return prev;
            }, 0);

            setStepsNotFinishedCount(stepsNotFinishedCount);

            // Don't show the onboarding bubble if all the steps are completed.
            if (!loading && called && stepsNotFinishedCount === 0) {
                setRainConfetti(true);
                message.success('You have finished onboarding 👏');
                setTimeout(() => {
                    setHasFinishedOnboarding(true);
                }, 1000 * 10);
                stopPolling();
            } else {
                startPolling(3000);
            }
        }

        return () => {
            stopPolling();
        };
    }, [
        called,
        data,
        history,
        loading,
        organization_id,
        setHasFinishedOnboarding,
        startPolling,
        stopPolling,
    ]);

    if (rainConfetti) {
        return <Confetti recycle={false} />;
    }

    if (loading) {
        return null;
    }

    return (
        <div className={classNames(styles.container)}>
            <Popover
                align={{ offset: [0, -24] }}
                placement="topLeft"
                trigger={['click']}
                onVisibleChange={(visible) => {
                    if (visible) {
                        H.track('Viewed onboarding bubble', {});
                    }
                }}
                hasBorder
                content={
                    <>
                        <div className={styles.onboardingBubblePopover}>
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
                        </div>
                        <ul className={styles.stepsContainer}>
                            {steps.map((step) => (
                                <li key={step.displayName}>
                                    <Tooltip
                                        title={step.tooltip}
                                        placement="right"
                                    >
                                        {/* TODO: Add box shadow on button */}
                                        {/* Make it span the full width of the popover */}
                                        <Button
                                            onClick={step.action}
                                            type="text"
                                            className={classNames({
                                                [styles.stepCompleted]:
                                                    step.completed,
                                            })}
                                        >
                                            {/* TODO: Swap this with the check on the setup page */}
                                            <SvgCircleCheckIcon
                                                className={classNames(
                                                    styles.checkIcon,
                                                    {
                                                        [styles.checkIconCompleted]:
                                                            step.completed,
                                                    }
                                                )}
                                            />
                                            {step.displayName}
                                        </Button>
                                    </Tooltip>
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
    );
};

export default OnboardingBubble;

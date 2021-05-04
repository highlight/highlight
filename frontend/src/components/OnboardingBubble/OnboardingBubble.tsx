import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useState } from 'react';
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

interface Props {
    collapsed: boolean;
}

interface OnboardingStep {
    displayName: string;
    action: () => void;
    completed: boolean;
    tooltip?: string;
}

const OnboardingBubble = ({ collapsed }: Props) => {
    const history = useHistory();
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const [steps, setSteps] = useState<OnboardingStep[]>([]);
    const { data: admin_data } = useGetAdminQuery({ skip: false });
    const { loading } = useGetOnboardingStepsQuery({
        variables: {
            organization_id,
            admin_id: (admin_data?.admin?.id as string) || '',
        },
        onCompleted: (data) => {
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
        },
    });

    const stepsNotFinishedCount = steps.reduce((prev, curr) => {
        if (!curr.completed) {
            return prev + 1;
        }
        return prev;
    }, 0);

    // Don't show the onboarding bubble if all the steps are completed.
    if (stepsNotFinishedCount === 0 || loading) {
        return null;
    }

    return (
        <div
            className={classNames(styles.container, {
                [styles.collapsed]: collapsed,
            })}
        >
            <Popover
                align={{ offset: [0, -24] }}
                placement="topLeft"
                trigger={['click']}
                onVisibleChange={(visible) => {
                    if (visible) {
                        H.track('Viewed onboarding bubble', {});
                    }
                }}
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
                                        <Button
                                            onClick={step.action}
                                            type="text"
                                        >
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
                <PillButton type="primary">
                    <div className={styles.stepsCount}>
                        {stepsNotFinishedCount}
                    </div>
                    Highlight setup
                </PillButton>
            </Popover>
        </div>
    );
};

export default OnboardingBubble;

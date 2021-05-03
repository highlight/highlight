import classNames from 'classnames';
import { H } from 'highlight.run';
import React from 'react';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';
import SvgCircleCheckIcon from '../../static/CircleCheckIcon';
import Button from '../Button/Button/Button';
import PillButton from '../Button/PillButton/PillButton';
import Popover from '../Popover/Popover';
import Progress from '../Progress/Progress';
import styles from './OnboardingBubble.module.scss';

interface Props {
    collapsed: boolean;
}

interface OnboardingStep {
    displayName: string;
    action: () => void;
    completed: boolean;
}

const OnboardingBubble = ({ collapsed }: Props) => {
    const history = useHistory();
    const { organization_id } = useParams<{
        organization_id: string;
    }>();

    const STEPS: OnboardingStep[] = [
        {
            displayName: 'Install the Highlight SDK',
            action: () => {
                history.push(`/${organization_id}/setup`);
            },
            completed: true,
        },
        {
            displayName: 'Integrate with Slack',
            action: () => {
                history.push(`/${organization_id}/setup`);
            },
            completed: false,
        },
        {
            displayName: 'Invite your team',
            action: () => {
                history.push(`/${organization_id}/team`);
            },
            completed: false,
        },
        {
            displayName: 'View your first session',
            action: () => {
                history.push(`/${organization_id}/sessions`);
            },
            completed: false,
        },
        {
            displayName: 'Create your first comment',
            action: () => {
                history.push(`/${organization_id}/sessions`);
            },
            completed: false,
        },
    ];

    const stepsNotFinishedCount = STEPS.reduce((prev, curr) => {
        if (!curr.completed) {
            return prev + 1;
        }
        return prev;
    }, 0);

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
                                    numerator={1}
                                    denominator={6}
                                    showInfo
                                />
                            </div>
                        </div>
                        <ul className={styles.stepsContainer}>
                            {STEPS.map((step) => (
                                <li key={step.displayName}>
                                    <Button onClick={step.action} type="text">
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

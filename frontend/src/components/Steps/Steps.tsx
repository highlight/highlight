import Button from '@components/Button/Button/Button';
import {
    StepProps as AntDesignStepProps,
    // Disabling here because we are using this file as a proxy.
    // eslint-disable-next-line no-restricted-imports
    Steps as AntDesignSteps,
    StepsProps as AntDesignStepsProps,
} from 'antd';
import React, { useEffect, useState } from 'react';

import styles from './Steps.module.scss';

interface Step {
    title: string;
    content: React.ReactNode;
    disableNextButton?: boolean;
}

type StepsProps = Pick<
    AntDesignStepsProps,
    'current' | 'type' | 'className'
> & {
    steps: Step[];
    /** Called when navigating to the previous step. */
    onPrevious?: () => void;
    /** Called when navigating to the next step. */
    onNext?: () => void;
    /** Called when the primary action on the last step is called. */
    onFinish?: () => void;
    disableFinishButton?: boolean;
    finishButtonLabel?: string;
};

interface StepsType extends React.FC<StepsProps> {
    Step: React.ClassicComponentClass<AntDesignStepProps>;
}

/**
 * A proxy for Ant Design's steps. This component should be used instead of directly using Ant Design's.
 */
const Steps: StepsType = ({
    current,
    type,
    steps,
    onFinish,
    onNext,
    onPrevious,
    className,
    disableFinishButton,
    finishButtonLabel = 'Finish',
    ...props
}) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(current || 0);
    const currentStep = steps[currentStepIndex];

    useEffect(() => {
        if (current) {
            setCurrentStepIndex(current);
        }
    }, [current]);

    return (
        <div className={className}>
            <AntDesignSteps
                className={styles.steps}
                type={type}
                current={currentStepIndex}
                onChange={setCurrentStepIndex}
                {...props}
            >
                {steps.map((step, index) => (
                    <AntDesignSteps.Step
                        key={step.title}
                        title={step.title}
                        status={
                            index > currentStepIndex
                                ? 'wait'
                                : index < currentStepIndex
                                ? 'finish'
                                : 'process'
                        }
                        disabled={
                            index - 1 > -1
                                ? steps[index - 1].disableNextButton
                                : false
                        }
                    />
                ))}
            </AntDesignSteps>

            <main className={styles.main}>{currentStep.content}</main>
            <footer className={styles.footer}>
                {currentStepIndex >= 1 && (
                    <Button
                        trackingId="StepsPrevious"
                        style={{ margin: '0 8px' }}
                        onClick={() => {
                            if (onPrevious) {
                                onPrevious();
                            }

                            setCurrentStepIndex((c) => c - 1);
                        }}
                    >
                        Previous
                    </Button>
                )}
                {currentStepIndex === steps.length - 1 && (
                    <Button
                        type="primary"
                        trackingId="StepsFinish"
                        disabled={disableFinishButton}
                        onClick={onFinish}
                    >
                        {finishButtonLabel}
                    </Button>
                )}
                {currentStepIndex < steps.length - 1 && (
                    <Button
                        type="primary"
                        trackingId="StepsNext"
                        className={styles.nextButton}
                        disabled={currentStep.disableNextButton}
                        onClick={() => {
                            if (onNext) {
                                onNext();
                            }
                            setCurrentStepIndex((c) => c + 1);
                        }}
                    >
                        Next Step
                    </Button>
                )}
            </footer>
        </div>
    );
};

Steps.Step =
    AntDesignSteps.Step as unknown as React.ClassicComponentClass<AntDesignStepProps>;

export default Steps;

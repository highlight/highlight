import {
    StepProps as AntDesignStepProps,
    // Disabling here because we are using this file as a proxy.
    // eslint-disable-next-line no-restricted-imports
    Steps as AntDesignSteps,
    StepsProps as AntDesignStepsProps,
} from 'antd';
import React from 'react';

type StepsProps = Pick<AntDesignStepsProps, 'className' | 'current' | 'type'>;

interface StepsType extends React.FC<StepsProps> {
    Step: React.ClassicComponentClass<AntDesignStepProps>;
}

/**
 * A proxy for Ant Design's steps. This component should be used instead of directly using Ant Design's.
 */
const Steps: StepsType = ({ current, className, type, children, ...props }) => {
    return (
        <AntDesignSteps
            className={className}
            type={type}
            current={current}
            {...props}
        >
            {children}
        </AntDesignSteps>
    );
};

Steps.Step = AntDesignSteps.Step;

export default Steps;

import classNames from 'classnames';
import React from 'react';
import PillButton from '../Button/PillButton/PillButton';
import styles from './OnboardingBubble.module.scss';

interface Props {
    collapsed: boolean;
}

const OnboardingBubble = ({ collapsed }: Props) => {
    return (
        <div
            className={classNames(styles.container, {
                [styles.collapsed]: collapsed,
            })}
        >
            <PillButton type="primary">Highlight setup</PillButton>
        </div>
    );
};

export default OnboardingBubble;

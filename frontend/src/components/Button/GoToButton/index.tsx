import React from 'react';
import styles from './index.module.scss';
import { ReactComponent as ReferrerIcon } from '../../../static/referrer.svg';
import classNames from 'classnames';

interface GoToButtonComponentProps {
    label?: string;
}

type GoToButtonProps = GoToButtonComponentProps &
    React.HTMLAttributes<HTMLButtonElement>;

const GoToButton = ({ label = 'Goto', ...props }: GoToButtonProps) => {
    return (
        <button
            {...props}
            className={classNames(styles.goToButton, props.className)}
        >
            {label} <ReferrerIcon className={styles.icon} />
        </button>
    );
};

export default GoToButton;

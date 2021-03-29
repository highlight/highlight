import classNames from 'classnames';
import React from 'react';
import styles from './PrimaryButton.module.scss';

const PrimaryButton = ({
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button
            {...props}
            className={classNames(props.className, styles.primaryButton)}
        >
            {children}
        </button>
    );
};

export default PrimaryButton;

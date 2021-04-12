import classNames from 'classnames';
import React from 'react';
import styles from './SecondaryButton.module.scss';

const SecondaryButton = ({
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button
            {...props}
            className={classNames(props.className, styles.secondaryButton)}
        >
            {children}
        </button>
    );
};

export default SecondaryButton;

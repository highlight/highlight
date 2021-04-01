import classNames from 'classnames';
import React from 'react';
import styles from './TransparentButton.module.scss';

const TransparentButton = ({
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button
            {...props}
            className={classNames(props.className, styles.transparentButton)}
        >
            {children}
        </button>
    );
};

export default TransparentButton;

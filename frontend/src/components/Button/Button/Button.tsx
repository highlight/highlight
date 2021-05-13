import { Button as AntDesignButton, ButtonProps } from 'antd';
import classNames from 'classnames';
import React from 'react';

import styles from './Button.module.scss';

const Button = ({
    children,
    ...props
}: React.PropsWithChildren<ButtonProps>) => {
    return (
        <AntDesignButton
            {...props}
            className={classNames(props.className, styles.buttonBase)}
        >
            {children}
        </AntDesignButton>
    );
};

export default Button;

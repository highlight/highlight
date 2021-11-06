import { Input as AntDesignInput, InputProps } from 'antd';
import classNames from 'classnames';
import React from 'react';

import styles from './Input.module.scss';

type Props = InputProps & {
    ref?: any;
};

const Input = (props: Props) => {
    return (
        <AntDesignInput
            {...props}
            className={classNames(props.className, styles.input)}
        />
    );
};

export default Input;

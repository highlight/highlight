// eslint-disable-next-line no-restricted-imports
import { Switch as AntDesignSwitch, SwitchProps } from 'antd';
import classNames from 'classnames';
import React from 'react';

import styles from './Switch.module.scss';

type Props = Pick<SwitchProps, 'checked' | 'onChange' | 'loading'> & {
    label: string;
};

const Switch = ({ label, ...props }: Props) => {
    return (
        <label
            className={classNames(styles.label, {
                [styles.checked]: props.checked,
            })}
        >
            <AntDesignSwitch {...props} />
            {label}
        </label>
    );
};

export default Switch;

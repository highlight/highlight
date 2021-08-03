// eslint-disable-next-line no-restricted-imports
import { Switch as AntDesignSwitch, SwitchProps } from 'antd';
import classNames from 'classnames';
import React from 'react';

import styles from './Switch.module.scss';

type Props = Pick<SwitchProps, 'checked' | 'onChange' | 'loading'> & {
    label: string;
    /** Renders the label before the switch. */
    labelFirst?: boolean;
    /** Renders the label and the switch with space-between. */
    justifySpaceBetween?: boolean;
    noMarginAroundSwitch?: boolean;
};

const Switch = ({
    label,
    labelFirst,
    justifySpaceBetween,
    noMarginAroundSwitch,
    ...props
}: Props) => {
    const labelToRender = <span>{label}</span>;

    return (
        <label
            className={classNames(styles.label, {
                [styles.checked]: props.checked,
                [styles.spaceBetween]: justifySpaceBetween,
                [styles.noMarginAroundSwitch]: noMarginAroundSwitch,
            })}
        >
            {labelFirst && labelToRender}
            <AntDesignSwitch {...props} />
            {!labelFirst && labelToRender}
        </label>
    );
};

export default Switch;

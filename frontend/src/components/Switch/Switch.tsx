// eslint-disable-next-line no-restricted-imports
import { Switch as AntDesignSwitch, SwitchProps } from 'antd';
import classNames from 'classnames';
import React from 'react';

import styles from './Switch.module.scss';

type Props = Pick<
    SwitchProps,
    'checked' | 'onChange' | 'loading' | 'className'
> & {
    label: string | React.ReactNode;
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
    className,
    ...props
}: Props) => {
    const labelToRender = <span>{label}</span>;

    return (
        <label
            className={classNames(styles.label, className, {
                [styles.checked]: props.checked,
                [styles.spaceBetween]: justifySpaceBetween,
                [styles.noMarginAroundSwitch]: noMarginAroundSwitch,
            })}
        >
            {labelFirst && labelToRender}
            <AntDesignSwitch {...props} size="small" />
            {!labelFirst && labelToRender}
        </label>
    );
};

export default Switch;

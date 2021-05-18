import { Button, ButtonProps } from 'antd';
import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

import useToggle from '../../../hooks/useToggle/useToggle';
import Dot, { DotSize } from '../../Dot/Dot';
import styles from './ToggleButton.module.scss';

type Props = ButtonProps & {
    initialValue: boolean;
};

const ToggleButton = ({
    children,
    initialValue,
    ...props
}: PropsWithChildren<Props>) => {
    const [isEnabled, toggleEnabled] = useToggle(initialValue);

    return (
        <Button
            {...props}
            className={classNames(props.className, styles.toggleButton, {
                [styles.enabled]: isEnabled,
            })}
            value="checked"
            type="text"
            aria-pressed={isEnabled}
            onClick={(e) => {
                toggleEnabled();
                if (props.onClick) {
                    props.onClick(e);
                }
            }}
        >
            {children}
            <div className={styles.dotContainer}>
                {<Dot size={DotSize.xxSmall} />}
            </div>
        </Button>
    );
};

export default ToggleButton;

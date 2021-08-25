import { Button as AntDesignButton, ButtonProps } from 'antd';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React from 'react';

import styles from './ToggleButton.module.scss';

type Props = ButtonProps & {
    /** The ID used for identifying that this button was clicked for analytics. */
    trackingId: string;
    /** Whether the toggle is enabled. */
    toggled: boolean;
    /** A prefix icon. */
    prefixIcon?: React.ReactNode;
    /** Renders only the icon if true. */
    hideTextLabel?: boolean;
    iconButton?: boolean;
};

const ToggleButton: React.FC<Props> = ({
    children,
    trackingId,
    toggled,
    prefixIcon,
    hideTextLabel,
    iconButton,
    className,
    ...props
}) => {
    return (
        <AntDesignButton
            {...props}
            onClick={(e) => {
                if (props.onClick) {
                    props.onClick(e);
                }
                H.track(`ToggleButton-${trackingId}`);
            }}
            className={classNames(styles.toggleButtonBase, className, {
                [styles.toggled]: toggled,
                [styles.iconButton]: iconButton,
            })}
        >
            {prefixIcon}

            {!hideTextLabel && children}
        </AntDesignButton>
    );
};

export default ToggleButton;

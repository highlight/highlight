import React from 'react';
import {
    // Disabling here because we are using this file as a proxy.
    // eslint-disable-next-line no-restricted-imports
    Popover as AntDesignPopover,
    PopoverProps as AntDesignPopoverProps,
} from 'antd';
import styles from './TransparentPopover.module.scss';

type TransparentPopoverProps = Pick<
    AntDesignPopoverProps,
    | 'content'
    | 'title'
    | 'trigger'
    | 'defaultVisible'
    | 'onVisibleChange'
    | 'placement'
    | 'align'
    | 'visible'
>;

/**
 * A proxy for Ant Design's popover. This component should be used instead of directly using Ant Design's.
 * This is different than Popover as the container does not have any styles.
 */
const TransparentPopover: React.FC<TransparentPopoverProps> = ({
    children,
    ...props
}) => {
    return (
        <AntDesignPopover overlayClassName={styles.popover} {...props}>
            {children}
        </AntDesignPopover>
    );
};

export default TransparentPopover;

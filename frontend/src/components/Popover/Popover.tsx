import React from 'react';
import {
    // Disabling here because we are using this file as a proxy.
    // eslint-disable-next-line no-restricted-imports
    Popover as AntDesignPopover,
    PopoverProps as AntDesignPopoverProps,
} from 'antd';
import styles from './Popover.module.scss';

type PopoverProps = Pick<
    AntDesignPopoverProps,
    'content' | 'title' | 'trigger'
>;

/**
 * A proxy for Ant Design's popover. This component should be used instead of directly using Ant Design's.
 */
const Popover: React.FC<PopoverProps> = ({ children, title, ...props }) => {
    return (
        <AntDesignPopover
            {...props}
            content={
                <>
                    {title}
                    <div className={styles.content}>{props.content}</div>
                </>
            }
        >
            {children}
        </AntDesignPopover>
    );
};

export default Popover;

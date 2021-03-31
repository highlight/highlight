import React from 'react';
import {
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
            overlayStyle={{ maxWidth: `300px` }}
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

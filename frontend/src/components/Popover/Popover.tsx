import React from 'react';
import {
    // Disabling here because we are using this file as a proxy.
    // eslint-disable-next-line no-restricted-imports
    Popover as AntDesignPopover,
    PopoverProps as AntDesignPopoverProps,
} from 'antd';
import styles from './Popover.module.scss';
import classNames from 'classnames';

type PopoverProps = Pick<
    AntDesignPopoverProps,
    | 'content'
    | 'title'
    | 'trigger'
    | 'defaultVisible'
    | 'onVisibleChange'
    | 'placement'
    | 'align'
> & {
    hasBorder?: boolean;
};

/**
 * A proxy for Ant Design's popover. This component should be used instead of directly using Ant Design's.
 */
const Popover: React.FC<PopoverProps> = ({
    children,
    hasBorder,
    title,
    ...props
}) => {
    return (
        <AntDesignPopover
            overlayClassName={classNames({ [styles.popover]: hasBorder })}
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

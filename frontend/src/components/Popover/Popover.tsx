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
    | 'visible'
> & {
    hasBorder?: boolean;
    isList?: boolean;
    popoverClassName?: string;
};

/**
 * A proxy for Ant Design's popover. This component should be used instead of directly using Ant Design's.
 */
const Popover: React.FC<PopoverProps> = ({
    children,
    hasBorder,
    title,
    isList,
    popoverClassName,
    ...props
}) => {
    return (
        <AntDesignPopover
            overlayClassName={classNames(
                { [styles.popover]: hasBorder },
                popoverClassName
            )}
            {...props}
            content={
                <div
                    className={classNames({
                        [styles.contentContainer]: !isList,
                    })}
                >
                    {title}
                    <div className={styles.content}>{props.content}</div>
                </div>
            }
        >
            {children}
        </AntDesignPopover>
    );
};

export default Popover;

import classNames from 'classnames';
import React, { useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import styles from './PopoverListContent.module.scss';

interface Props {
    listItems: React.ReactNode[];
    className?: string;
    small?: boolean;
    noHoverChange?: boolean;
    virtual?: boolean;
    virtualListHeight?: number;
}

const PopoverListContent = ({
    listItems,
    className,
    small = false,
    noHoverChange,
    virtual,
    virtualListHeight,
}: Props) => {
    const virtuoso = useRef<VirtuosoHandle>(null);

    return (
        <ul
            className={classNames(styles.list, className)}
            style={{ height: virtual ? `${virtualListHeight}px` : 'initial' }}
        >
            {!virtual ? (
                listItems.map((listItem, index) => (
                    <li
                        key={index}
                        className={classNames(styles.item, {
                            [styles.small]: small,
                            [styles.noHoverChange]: noHoverChange,
                        })}
                    >
                        {listItem}
                    </li>
                ))
            ) : (
                <>
                    <Virtuoso
                        ref={virtuoso}
                        overscan={500}
                        data={listItems}
                        itemContent={(index, item: any) => (
                            <li
                                key={index}
                                className={classNames(
                                    styles.item,
                                    styles.virtual,
                                    {
                                        [styles.small]: small,
                                        [styles.noHoverChange]: noHoverChange,
                                    }
                                )}
                            >
                                {item}
                            </li>
                        )}
                    />
                </>
            )}
        </ul>
    );
};

export default PopoverListContent;

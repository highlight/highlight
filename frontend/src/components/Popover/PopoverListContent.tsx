import classNames from 'classnames';
import React from 'react';

import styles from './PopoverListContent.module.scss';

interface Props {
    listItems: React.ReactNode[];
    className?: string;
    small?: boolean;
}

const PopoverListContent = ({ listItems, className, small = false }: Props) => {
    return (
        <ul className={classNames(styles.list, className)}>
            {listItems.map((listItem, index) => (
                <li
                    key={index}
                    className={classNames(styles.item, {
                        [styles.small]: small,
                    })}
                >
                    {listItem}
                </li>
            ))}
        </ul>
    );
};

export default PopoverListContent;

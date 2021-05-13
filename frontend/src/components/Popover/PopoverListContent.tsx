import React from 'react';

import styles from './PopoverListContent.module.scss';

interface Props {
    listItems: React.ReactNode[];
}

const PopoverListContent = ({ listItems }: Props) => {
    return (
        <ul className={styles.list}>
            {listItems.map((listItem, index) => (
                <li key={index} className={styles.item}>
                    {listItem}
                </li>
            ))}
        </ul>
    );
};

export default PopoverListContent;

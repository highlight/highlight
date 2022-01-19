import { Menu as AntDesignMenu, MenuItemProps } from 'antd';
import React from 'react';

import styles from './MenuItem.module.scss';

type Props = {} & Pick<MenuItemProps, 'icon' | 'onClick' | 'children'>;

const MenuItem = ({ children, ...props }: Props) => {
    return (
        <AntDesignMenu.Item {...props} className={styles.menuItem}>
            {children}
        </AntDesignMenu.Item>
    );
};

export default MenuItem;

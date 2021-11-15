import { Dropdown, DropDownProps } from 'antd';
import { H } from 'highlight.run';
import React from 'react';

import SvgDotsHorizontalIcon from '../../static/DotsHorizontalIcon';
import styles from './DotsMenu.module.scss';

type Props = {
    /**
     * The menu options.
     * <Menu>
     *  <Menu.Item>
     *  <Menu.Item>
     * </Menu>
     */
    menu: JSX.Element;
    /** The trackingId for opening the menu. */
    trackingId: string;
} & Pick<DropDownProps, 'placement'>;

const DotsMenu = ({ menu, trackingId, placement }: Props) => {
    return (
        <Dropdown overlay={menu} trigger={['click']} placement={placement}>
            <button
                className={styles.button}
                onClick={() => {
                    H.track(trackingId);
                }}
            >
                <SvgDotsHorizontalIcon />
            </button>
        </Dropdown>
    );
};

export default DotsMenu;

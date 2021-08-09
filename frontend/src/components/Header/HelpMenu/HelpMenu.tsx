import React from 'react';
import { FiTwitter } from 'react-icons/fi';

import { useGetAdminQuery } from '../../../graph/generated/hooks';
import SvgBookIcon from '../../../static/BookIcon';
import SvgEditIcon from '../../../static/EditIcon';
import SvgHelpCircleIcon from '../../../static/HelpCircleIcon';
import SvgMessageIcon from '../../../static/MessageIcon';
import PopoverListContent from '../../Popover/PopoverListContent';
import PopoverMenu, { PopoverMenuItem } from '../../PopoverMenu/PopoverMenu';
import popoverMenuStyles from '../../PopoverMenu/PopoverMenu.module.scss';
import styles from './HelpMenu.module.scss';

const HelpMenu = () => {
    const { data } = useGetAdminQuery();

    const leadMenuItems: PopoverMenuItem[] = [
        {
            icon: <SvgMessageIcon />,
            displayName: 'Send us a message',
            action: () => {
                window.Intercom('boot', {
                    app_id: 'gm6369ty',
                    alignment: 'right',
                    hide_default_launcher: true,
                    email: data?.admin?.email,
                });
                window.Intercom('showNewMessage');
            },
        },
    ];

    const endMenuItems: PopoverMenuItem[] = [
        {
            icon: <SvgBookIcon />,
            displayName: 'Documentation',
            link: 'https://docs.highlight.run',
        },
        {
            icon: <SvgEditIcon />,
            displayName: 'Changelog',
            link: 'https://feedback.highlight.run/changelog',
        },
        {
            icon: <FiTwitter />,
            displayName: 'Twitter',
            link: 'https://twitter.com/highlightrun',
        },
    ];

    return (
        <PopoverMenu
            content={
                <>
                    <PopoverListContent
                        small
                        className={popoverMenuStyles.popoverMenuList}
                        listItems={leadMenuItems.map((menuItem) => (
                            <PopoverMenuItem
                                {...menuItem}
                                key={menuItem.displayName}
                            />
                        ))}
                    />
                    <hr className={styles.divider} />
                    <PopoverListContent
                        small
                        className={popoverMenuStyles.popoverMenuList}
                        listItems={endMenuItems.map((menuItem) => (
                            <PopoverMenuItem
                                {...menuItem}
                                key={menuItem.displayName}
                            />
                        ))}
                    />
                </>
            }
            buttonTrackingId="HelpMenu"
            buttonIcon={<SvgHelpCircleIcon />}
        ></PopoverMenu>
    );
};

export default HelpMenu;

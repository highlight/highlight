import React from 'react';
import { FiTwitter } from 'react-icons/fi';

import { useGetAdminQuery } from '../../../graph/generated/hooks';
import SvgBookIcon from '../../../static/BookIcon';
import SvgEditIcon from '../../../static/EditIcon';
import SvgHelpCircleIcon from '../../../static/HelpCircleIcon';
import SvgMessageIcon from '../../../static/MessageIcon';
import Button from '../../Button/Button/Button';
import Popover from '../../Popover/Popover';
import PopoverListContent from '../../Popover/PopoverListContent';
import styles from './HelpMenu.module.scss';

const HelpMenu = () => {
    const { data } = useGetAdminQuery();

    const leadMenuItems: HelpMenuItem[] = [
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

    const endMenuItems: HelpMenuItem[] = [
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
        <Popover
            isList
            hasBorder
            placement="bottomRight"
            content={
                <>
                    <PopoverListContent
                        small
                        className={styles.helpMenuList}
                        listItems={leadMenuItems.map((menuItem) => (
                            <HelpMenuItem
                                {...menuItem}
                                key={menuItem.displayName}
                            />
                        ))}
                    />
                    <hr className={styles.divider} />
                    <PopoverListContent
                        small
                        className={styles.helpMenuList}
                        listItems={endMenuItems.map((menuItem) => (
                            <HelpMenuItem
                                {...menuItem}
                                key={menuItem.displayName}
                            />
                        ))}
                    />
                </>
            }
        >
            <Button type="text" trackingId="HelpMenu" iconButton>
                <SvgHelpCircleIcon />
            </Button>
        </Popover>
    );
};

export default HelpMenu;

interface HelpMenuItem {
    icon: React.ReactNode;
    displayName: string;
    link?: string;
    action?: () => void;
}

const HelpMenuItem = ({ icon, displayName, action, link }: HelpMenuItem) => {
    if (action && link) {
        throw new Error(
            'Cannot set both action and link. A HelpMenuItem can only have either action or link.'
        );
    }

    if (action) {
        return (
            <Button
                onClick={action}
                trackingId={`HelpMenu-${displayName}`}
                type="text"
            >
                {icon}
                {displayName}
            </Button>
        );
    }

    if (link) {
        return (
            <a href={link} target="_blank" rel="noreferrer">
                {icon}
                {displayName}
            </a>
        );
    }

    return null;
};

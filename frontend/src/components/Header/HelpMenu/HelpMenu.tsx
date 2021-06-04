import React from 'react';
import { FiTwitter } from 'react-icons/fi';

import SvgBookIcon from '../../../static/BookIcon';
import SvgEditIcon from '../../../static/EditIcon';
import SvgHelpCircleIcon from '../../../static/HelpCircleIcon';
import SvgMessageIcon from '../../../static/MessageIcon';
import Button from '../../Button/Button/Button';
import Popover from '../../Popover/Popover';
import PopoverListContent from '../../Popover/PopoverListContent';
import styles from './HelpMenu.module.scss';

const HelpMenu = () => {
    const leadMenuItems: HelpMenuItem[] = [
        {
            icon: <SvgMessageIcon />,
            displayName: 'Send us a message',
            action: () => {
                console.log('send us a message');
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
            link: 'https://changes.highlight.run',
        },
        {
            icon: <FiTwitter />,
            displayName: 'Twitter',
            link: 'https://changes.highlight.run',
        },
    ];

    return (
        <Popover
            isList
            hasBorder
            visible
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

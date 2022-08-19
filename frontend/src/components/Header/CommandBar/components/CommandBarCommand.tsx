import React from 'react';
import { Command } from 'react-command-palette';
import { VscArrowRight, VscDeviceCameraVideo } from 'react-icons/vsc';
import { default as sanitizeHtml } from 'sanitize-html';

import SvgUsersIcon from '../../../../static/UsersIcon';
import styles from './CommandBarCommand.module.scss';

type Props = Command & {
    highlight: any[];
};

const CommandBarCommand = (suggestion: Props) => {
    const { name, highlight = [], category } = suggestion;

    let baseComponent = (
        <div className={styles.suggestion}>
            <span className={styles.category}>{getIcon(category)}</span>{' '}
            <span
                dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(highlight[0] || name),
                }}
            />
        </div>
    );

    if (!Array.isArray(highlight)) {
        baseComponent = (
            <div className={styles.suggestion}>
                <span className={styles.category}>{getIcon(category)}</span>{' '}
                <span
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(highlight || name),
                    }}
                />
            </div>
        );
    }

    return baseComponent;
};

export default CommandBarCommand;

const CATEGORY_ICON_MAPPING: { [key: string]: React.ReactNode } = {
    Navigation: <VscArrowRight />,
    Projects: <SvgUsersIcon />,
    Player: <VscDeviceCameraVideo />,
};

const getIcon = (category: string) => {
    switch (true) {
        case category in CATEGORY_ICON_MAPPING:
            return CATEGORY_ICON_MAPPING[category];
        default:
            return <VscArrowRight />;
    }
};

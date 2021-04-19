import React from 'react';

import devStyles from '../DevToolsWindow.module.scss';
import styles from './Option.module.scss';
import { ReactComponent as Close } from '../../../../../static/close.svg';
import {
    DevToolTabs,
    useDevToolsContext,
} from '../../DevToolsContext/DevToolsContext';

const DISPLAY_NAMES: { [key: string]: string } = {
    iframe: 'iFrame',
    other: 'Other',
    css: 'CSS',
    xmlhttprequest: 'XMLHttpRequest',
    script: 'Script',
    link: 'Link',
    fetch: 'Fetch',
} as const;

const getDisplayName = (value: string): string => {
    switch (true) {
        case value in DISPLAY_NAMES: {
            return DISPLAY_NAMES[value];
        }
        default:
            return value.charAt(0).toUpperCase() + value.slice(1);
    }
};

export const Option = ({
    onSelect,
    selected,
    optionValue,
}: {
    onSelect: () => void;
    selected: boolean;
    optionValue: string;
}) => {
    if (!optionValue || !optionValue.length) {
        return <></>;
    }
    return (
        <div
            className={devStyles.option}
            onClick={onSelect}
            style={{
                color: selected ? '#5629c6' : '#959595',
                fontWeight: selected ? 400 : 300,
                borderBottom: selected
                    ? '3px solid #5629c6'
                    : '3px solid white',
            }}
        >
            {getDisplayName(optionValue)}
        </div>
    );
};

export const DevToolsSelect = () => {
    const {
        setOpenDevTools,
        selectedTab,
        setSelectedTab,
    } = useDevToolsContext();

    const TABS = [
        { key: DevToolTabs.Errors, displayName: 'Errors' },
        { key: DevToolTabs.Console, displayName: 'Console' },
        { key: DevToolTabs.Network, displayName: 'Network' },
    ];

    return (
        <div className={devStyles.devToolsSelectWrapper}>
            {TABS.map(({ displayName, key }) => (
                <Option
                    key={key}
                    selected={selectedTab === key}
                    onSelect={() => {
                        setSelectedTab(key);
                    }}
                    optionValue={displayName}
                />
            ))}
            <Close
                className={styles.closeStyle}
                onClick={() => setOpenDevTools(false)}
            />
        </div>
    );
};

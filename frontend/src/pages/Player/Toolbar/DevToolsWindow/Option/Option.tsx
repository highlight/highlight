import React from 'react';

import devStyles from '../DevToolsWindow.module.scss';
import styles from './Option.module.scss';
import { ReactComponent as Close } from '../../../../../static/close.svg';
import {
    DevToolTabs,
    useDevToolsContext,
} from '../../DevToolsContext/DevToolsContext';

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
            {optionValue.charAt(0).toUpperCase() + optionValue.slice(1)}
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

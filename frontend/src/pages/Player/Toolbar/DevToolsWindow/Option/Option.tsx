import React from 'react';
import { Skeleton, Tabs } from 'antd';

import devStyles from '../DevToolsWindow.module.css';

export const Option = ({
    onSelect,
    selected,
    optionValue,
}: {
    onSelect: () => void;
    selected: boolean;
    optionValue: string;
}) => {
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

export const DevToolsSelect = ({
    onSelect,
    isConsole,
}: {
    onSelect: () => void;
    isConsole: boolean;
}) => {
    return (
        <div className={devStyles.devToolsSelectWrapper}>
            <Option
                selected={isConsole}
                onSelect={!isConsole ? onSelect : () => {}}
                optionValue={'Console'}
            />
            <Option
                selected={!isConsole}
                onSelect={isConsole ? onSelect : () => {}}
                optionValue={'Network'}
            />
        </div>
    );
};

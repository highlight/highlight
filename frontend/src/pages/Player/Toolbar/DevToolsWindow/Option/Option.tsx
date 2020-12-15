import React, { useContext } from 'react';

import devStyles from '../DevToolsWindow.module.scss';
import styles from './Option.module.scss';
import { ReactComponent as Close } from '../../../../../static/close.svg';
import {
    OpenDevToolsContext,
    IsConsoleContext,
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

export const DevToolsSelect = ({ isConsole }: { isConsole: boolean }) => {
    const { setOpenDevTools } = useContext(OpenDevToolsContext);
    const { setIsConsole } = useContext(IsConsoleContext);
    return (
        <div className={devStyles.devToolsSelectWrapper}>
            <Option
                selected={isConsole}
                onSelect={() => setIsConsole(true)}
                optionValue={'Console'}
            />
            <Option
                selected={!isConsole}
                onSelect={() => setIsConsole(false)}
                optionValue={'Network'}
            />
            <Close
                className={styles.closeStyle}
                onClick={() => setOpenDevTools(false)}
            />
        </div>
    );
};

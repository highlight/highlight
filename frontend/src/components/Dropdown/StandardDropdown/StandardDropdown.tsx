import { Dropdown } from 'antd';
import React, { useState } from 'react';

import { ReactComponent as DownIcon } from '../../../static/chevron-down-icon.svg';
import styles from './StandardDropdown.module.scss';

type Option = {
    label: string;
    value: number | string;
};

export const StandardDropdown = ({
    data,
    onSelect,
    defaultValue,
    disabled,
}: {
    data: ReadonlyArray<Option>;
    onSelect: React.Dispatch<React.SetStateAction<any>>;
    defaultValue?: Option;
    disabled?: boolean;
}) => {
    const [visible, setVisible] = useState(false);
    const [selection, setSelection] = useState(defaultValue || data[0]);
    const menu = (
        <div className={styles.dropdownMenu}>
            <div className={styles.dropdownInner}>
                {data?.map((o) => (
                    <div
                        className={styles.labelItem}
                        key={o?.label}
                        onClick={() => {
                            onSelect(o.value);
                            setSelection(o);
                            setVisible(false);
                        }}
                    >
                        <div className={styles.labelText}>{o?.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
    return (
        <Dropdown
            placement={'bottomLeft'}
            overlay={menu}
            onVisibleChange={(v) => setVisible(v)}
            trigger={['click']}
            disabled={disabled}
        >
            <div
                className={styles.dropdownHandler}
                onClick={(e) => e.preventDefault()}
            >
                <div className={styles.labelNameText}>{selection.label}</div>
                <DownIcon
                    className={styles.icon}
                    style={{
                        transform: visible ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                />
            </div>
        </Dropdown>
    );
};

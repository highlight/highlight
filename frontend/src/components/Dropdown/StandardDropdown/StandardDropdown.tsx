import { Dropdown } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

import { ReactComponent as DownIcon } from '../../../static/chevron-down-icon.svg';
import styles from './StandardDropdown.module.scss';

type Option = {
    label: string;
    value: number | string;
};

export const StandardDropdown = ({
    data,
    onSelect,
    display,
    defaultValue,
    disabled,
    className,
    labelClassName,
}: {
    data: ReadonlyArray<Option>;
    onSelect: React.Dispatch<React.SetStateAction<any>>;
    display?: React.ReactNode;
    defaultValue?: Option;
    disabled?: boolean;
    className?: string;
    labelClassName?: string;
}) => {
    const [visible, setVisible] = useState(false);
    const [selection, setSelection] = useState(defaultValue || data[0]);

    useEffect(() => {
        if (defaultValue) {
            setSelection(defaultValue);
        }
    }, [defaultValue]);

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
            className={className}
            overlayClassName={styles.overlay}
        >
            <div
                className={styles.dropdownHandler}
                onClick={(e) => e.preventDefault()}
            >
                {display ? (
                    display
                ) : (
                    <div
                        className={classNames(
                            styles.labelNameText,
                            labelClassName
                        )}
                    >
                        {selection.label}
                    </div>
                )}
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

import React from 'react';

import styles from './RadioGroup.module.scss';

export const RadioGroup = <T extends any>({
    onSelect,
    labels,
    selectedLabel,
    style,
}: {
    onSelect: (p: T) => void;
    labels: T[];
    selectedLabel: T;
    style?: React.CSSProperties;
}) => {
    const labelDivs = labels.map((label, i) => {
        return label === selectedLabel ? (
            <div
                key={i}
                style={{
                    borderColor: '#5629c6',
                    backgroundColor: '#5629c6',
                    color: 'white',
                }}
                className={styles.platformOption}
                onClick={() => onSelect(label)}
            >
                {' '}
                {label}{' '}
            </div>
        ) : (
            <div
                key={i}
                style={{
                    borderColor: '#eaeaea',
                    color: 'black',
                }}
                className={styles.platformOption}
                onClick={() => onSelect(label)}
            >
                {' '}
                {label}{' '}
            </div>
        );
    });
    return (
        <div style={style} className={styles.radioGroupWrapper}>
            {labelDivs}
        </div>
    );
};

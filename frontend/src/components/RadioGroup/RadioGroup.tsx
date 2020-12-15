import React from 'react';

import styles from './RadioGroup.module.scss';


export const RadioGroup = <T extends any>({
    onSelect,
    labels,
    selectedLabel,
}: {
    onSelect: (p: T) => void;
    labels: T[];
    selectedLabel: T;
}
) => {
    const labelDivs = labels.map(label => {
        return label === selectedLabel ?
            <div style={{
                borderRight: 'none',
                borderColor: '#5629c6',
                backgroundColor: '#5629c6',
                color: 'white',
            }}
                className={styles.platformOption}
                onClick={() => onSelect(label)}
            > {label} </div>
            : <div
                style={{
                    borderRight: 'none',
                    borderColor:
                        '#eaeaea',
                    backgroundColor:
                        'white',
                    color: 'black',
                }}
                className={styles.platformOption}
                onClick={() => onSelect(label)}
            > {label} </div>

    })
    return (
        <div className={styles.radioGroupWrapper}>
            {labelDivs}
        </div>
    )
}
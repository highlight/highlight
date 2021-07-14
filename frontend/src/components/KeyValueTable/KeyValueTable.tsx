import React from 'react';

import InfoTooltip from '../InfoTooltip/InfoTooltip';
import styles from './KeyValueTable.module.scss';

interface Props {
    data: KeyValueTableRow[];
}

export interface KeyValueTableRow {
    keyDisplayValue: string;
    valueDisplayValue: string | React.ReactNode;
    /** Set this if the value needs an InfoTooltip. */
    valueInfoTooltipMessage?: string | React.ReactNode;
}

const KeyValueTable = ({ data }: Props) => {
    return (
        <div className={styles.table}>
            {data.map(
                ({
                    keyDisplayValue,
                    valueDisplayValue,
                    valueInfoTooltipMessage,
                }) => (
                    <React.Fragment
                        key={`${keyDisplayValue}-${valueDisplayValue}-${valueInfoTooltipMessage}`}
                    >
                        <p className={styles.key}>{keyDisplayValue}</p>
                        <p className={styles.value}>
                            {valueDisplayValue}{' '}
                            {valueInfoTooltipMessage && (
                                <InfoTooltip
                                    title={valueInfoTooltipMessage}
                                    className={styles.infoTooltip}
                                />
                            )}
                        </p>
                    </React.Fragment>
                )
            )}
        </div>
    );
};

export default KeyValueTable;

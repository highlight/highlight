import React from 'react';
import ReactJson from 'react-json-view';

import InfoTooltip from '../InfoTooltip/InfoTooltip';
import styles from './KeyValueTable.module.scss';

interface Props {
    data: KeyValueTableRow[];
    noDataMessage?: string | React.ReactNode;
}

export interface KeyValueTableRow {
    keyDisplayValue: string;
    valueDisplayValue: string | React.ReactNode | object;
    /** Set this if the value needs an InfoTooltip. */
    valueInfoTooltipMessage?: string | React.ReactNode;
    renderType: 'string' | 'json';
}

const KeyValueTable = ({ data, noDataMessage = <p>No data</p> }: Props) => {
    return (
        <div className={styles.table}>
            {data.length === 0
                ? noDataMessage
                : data.map(
                      ({
                          keyDisplayValue,
                          valueDisplayValue,
                          valueInfoTooltipMessage,
                          renderType,
                      }) => (
                          <React.Fragment
                              key={`${keyDisplayValue}-${valueDisplayValue}-${valueInfoTooltipMessage}`}
                          >
                              <p className={styles.key}>{keyDisplayValue}</p>
                              <p className={styles.value}>
                                  {renderType === 'string' ? (
                                      <>
                                          {valueDisplayValue}{' '}
                                          {valueInfoTooltipMessage && (
                                              <InfoTooltip
                                                  title={
                                                      valueInfoTooltipMessage
                                                  }
                                                  className={styles.infoTooltip}
                                              />
                                          )}
                                      </>
                                  ) : !!valueDisplayValue ? (
                                      <ReactJson
                                          src={valueDisplayValue as object}
                                          collapsed
                                          displayDataTypes={false}
                                          collapseStringsAfterLength={100}
                                          quotesOnKeys={false}
                                          name={null}
                                      />
                                  ) : (
                                      'undefined'
                                  )}
                              </p>
                          </React.Fragment>
                      )
                  )}
        </div>
    );
};

export default KeyValueTable;

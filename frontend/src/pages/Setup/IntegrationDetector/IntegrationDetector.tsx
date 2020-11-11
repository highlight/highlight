import React from 'react';

import PuffLoader from 'react-spinners/PuffLoader';
import styles from './IntegrationDetector.module.css';
import { Tooltip } from 'antd';
import { ReactComponent as CheckIcon } from '../../../static/check.svg';

export const IntegrationDetector = ({
    integrated,
}: {
    integrated: boolean;
}) => {
    return (
        <Tooltip
            title={
                integrated
                    ? 'Highlight is installed!'
                    : 'Waiting for Highlight to be installed.'
            }
        >
            <div className={styles.detectorWrapper}>
                <div className={styles.loaderWrapper}>
                    {integrated ? (
                        <CheckIcon className={styles.checkIcon} />
                    ) : (
                        <PuffLoader color="#5629c6" size={18} />
                    )}
                </div>
            </div>
        </Tooltip>
    );
};

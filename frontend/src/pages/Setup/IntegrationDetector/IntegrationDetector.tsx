import React from 'react';

// @ts-ignore
import Spinner from 'react-spinkit';
import styles from './IntegrationDetector.module.css';
import { Tooltip } from 'antd';
import { ReactComponent as CheckIcon } from '../../../static/verify-check.svg';

export const IntegrationDetector = ({
    integrated,
    verbose,
}: {
    integrated: boolean;
    verbose: boolean;
}) => {
    return (
        <div className={styles.detector}>
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
                            <div className="blob" />
                        )}
                    </div>
                </div>
            </Tooltip>
            {verbose ? (
                <div className={styles.verificationText}>
                    {integrated
                        ? 'Installation Verified.'
                        : 'Waiting for Verification.'}
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};

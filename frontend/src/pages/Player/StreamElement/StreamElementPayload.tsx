import React from 'react';
import validator from 'validator';

import InfoTooltip from '../../../components/InfoTooltip/InfoTooltip';
import styles from './StreamElementPayload.module.scss';
import { isJson } from './utils';

interface StreamElementProps {
    payload?: string;
}

const StreamElementPayload = ({ payload }: StreamElementProps) => {
    if (!payload) {
        return null;
    }

    const validatorUrlOptions: validator.IsURLOptions = {
        require_host: false,
        allow_trailing_dot: true,
        require_protocol: true,
        require_tld: false,
    };

    if (validator.isURL(payload, validatorUrlOptions)) {
        return (
            <div>
                <a
                    href={payload}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.anchor}
                >
                    {payload}
                </a>
            </div>
        );
    }

    if (isJson(payload)) {
        const object = JSON.parse(payload);
        const keys = Object.keys(object);
        // Do not show keys that have empty values.
        const emptyValuesRemovedKeys = keys.filter((key) => object[key] !== '');

        return (
            <div className={styles.objectList}>
                {emptyValuesRemovedKeys.map((key) => (
                    <>
                        <span className={styles.objectKey}>{key}</span>{' '}
                        <span className={styles.objectValue}>
                            {validator.isURL(
                                object[key]?.toString() || '',
                                validatorUrlOptions
                            ) ? (
                                <a href={object[key]}>{object[key]}</a>
                            ) : (
                                object[key]?.toString() || (
                                    <>
                                        undefined{' '}
                                        <InfoTooltip
                                            title={`No value was provided for ${key} from your application.`}
                                            align={{ offset: [12, 0] }}
                                            placement="topRight"
                                        />
                                    </>
                                )
                            )}
                        </span>
                    </>
                ))}
            </div>
        );
    }

    return <div>{payload}</div>;
};

export default StreamElementPayload;

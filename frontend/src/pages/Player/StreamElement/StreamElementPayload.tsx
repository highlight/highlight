import React from 'react';
import validator from 'validator';
import { isJson } from './utils';
import styles from './StreamElementPayload.module.scss';

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
            <a
                href={payload}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.anchor}
            >
                {payload}
            </a>
        );
    }

    if (isJson(payload)) {
        const object = JSON.parse(payload);
        const keys = Object.keys(object);
        // Do not show keys that have empty values.
        const emptyValuesRemovedKeys = keys.filter((key) => object[key] !== '');

        return (
            <ul className={styles.objectList}>
                {emptyValuesRemovedKeys.map((key) => (
                    <li key={key} className={styles.objectRecord}>
                        <p className={styles.payload}>
                            <span className={styles.objectKey}>{key}</span>{' '}
                            <span className={styles.objectValue}>
                                {validator.isURL(
                                    object[key].toString(),
                                    validatorUrlOptions
                                ) ? (
                                    <a href={object[key]}>{object[key]}</a>
                                ) : (
                                    object[key]
                                )}
                            </span>
                        </p>
                    </li>
                ))}
            </ul>
        );
    }

    return <>{payload}</>;
};

export default StreamElementPayload;

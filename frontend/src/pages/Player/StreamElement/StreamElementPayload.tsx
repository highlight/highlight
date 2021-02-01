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
        require_protocol: false,
        require_tld: false,
    };

    if (validator.isURL(payload, validatorUrlOptions)) {
        return (
            <a href={payload} target="_blank" rel="noopener noreferrer">
                {payload}
            </a>
        );
    }

    if (isJson(payload)) {
        const object = JSON.parse(payload);
        const keys = Object.keys(object);

        return (
            <ul className={styles.objectList}>
                {keys.map((key) => (
                    <li key={key} className={styles.objectRecord}>
                        <p className={styles.payload}>
                            <div className={styles.objectKey}>{key}</div>{' '}
                            <div className={styles.objectValue}>
                                {validator.isURL(
                                    object[key],
                                    validatorUrlOptions
                                ) ? (
                                    <a href={object[key]}>{object[key]}</a>
                                ) : (
                                    object[key]
                                )}
                            </div>
                        </p>
                    </li>
                ))}
            </ul>
        );
    }

    return <>{payload}</>;
};

export default StreamElementPayload;

import React from 'react';
import validator from 'validator';
import { isJson } from './utils';
import styles from './StreamElementPayload.module.scss';
import { Tooltip } from 'antd';

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
            <a href={payload} target="_blank">
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
                    <li key={key}>
                        <Tooltip title={`${key}: ${object[key]}`}>
                            <p className={styles.payload}>
                                <span className={styles.objectKey}>{key}</span>{' '}
                                <span>
                                    {validator.isURL(
                                        object[key],
                                        validatorUrlOptions
                                    ) ? (
                                        <a href={object[key]}>{object[key]}</a>
                                    ) : (
                                        object[key]
                                    )}
                                </span>
                            </p>
                        </Tooltip>
                    </li>
                ))}
            </ul>
        );
    }

    return <>{payload}</>;
};

export default StreamElementPayload;

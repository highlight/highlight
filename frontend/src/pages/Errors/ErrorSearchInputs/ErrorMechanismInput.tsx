import React from 'react';

import Select from '../../../components/Select/Select';
import { useErrorSearchContext } from '../ErrorSearchContext/ErrorSearchContext';
import styles from './ErrorStateInput.module.scss';

export const ErrorType = [
    'BACKEND',
    'console.error',
    'window.onerror',
    'custom',
];

export const ErrorTypeOptions = ErrorType.map((val: string) => ({
    displayValue: `${val}`,
    value: val,
    id: val,
}));

const ErrorTypeInput = () => {
    const { searchParams, setSearchParams } = useErrorSearchContext();

    const options: {
        displayValue: string;
        value: string;
        id: string;
    }[] = [
        { displayValue: 'All', value: 'ALL', id: 'ALL' },
        ...ErrorTypeOptions,
    ];

    return (
        <div>
            <Select
                className={styles.select}
                options={options}
                value={searchParams.type || 'ALL'}
                onChange={(newType) => {
                    setSearchParams((previousSearchParams) => ({
                        ...previousSearchParams,
                        type: newType === 'ALL' ? undefined : newType,
                    }));
                }}
            />
        </div>
    );
};

export default ErrorTypeInput;

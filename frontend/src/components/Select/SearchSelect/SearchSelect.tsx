import { Select } from 'antd';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';

import styles from './SearchSelect.module.scss';

export interface SearchOption {
    value: string;
    label: string;
}

export const SearchSelect = ({
    onSelect,
    options,
    loadOptions,
    value,
}: {
    onSelect: (name: string) => void;
    options: SearchOption[];
    loadOptions: (input: string) => void;
    value?: string;
}) => {
    const [isTyping, setIsTyping] = useState(false);

    return (
        <Select
            className={styles.select}
            // this mode allows using the select component as a single searchable input
            // @ts-ignore
            mode="SECRET_COMBOBOX_MODE_DO_NOT_USE"
            placeholder={'graphql.operation.users'}
            autoFocus
            onChange={() => {
                setIsTyping(false);
            }}
            onInputKeyDown={() => setIsTyping(true)}
            onSelect={(newValue: SearchOption) => {
                onSelect(newValue?.value || '');
            }}
            defaultValue={{ label: value, value: value } as SearchOption}
            loading={isTyping}
            options={options}
            notFoundContent={() => <span>`No results found`</span>}
            labelInValue
            filterOption={false}
            onSearch={loadOptions}
        />
    );
};

export const SimpleSearchSelect = ({
    onSelect,
    options,
    value,
    freeSolo,
    placeholder,
}: {
    onSelect: (name: string) => void;
    options: string[];
    value?: string;
    freeSolo?: boolean;
    placeholder?: string;
}) => {
    const [isTyping, setIsTyping] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
    const [extraOption, setExtraOption] = useState<SearchOption>();

    const getValueOptions = (input: string) => {
        setFilteredOptions(
            options.filter(
                (m) => m.toLowerCase().indexOf(input.toLowerCase()) !== -1
            ) || []
        );
        setIsTyping(false);
    };

    // Ignore this so we have a consistent reference so debounce works.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadOptions = useMemo(() => _.debounce(getValueOptions, 100), [
        options,
    ]);

    // initial load of options
    useEffect(() => {
        if (!filteredOptions.length && options.length) {
            loadOptions('');
        }
    }, [loadOptions, filteredOptions, options]);

    return (
        <Select
            className={styles.select}
            // this mode allows using the select component as a single searchable input
            // @ts-ignore
            mode="SECRET_COMBOBOX_MODE_DO_NOT_USE"
            placeholder={placeholder || 'graphql_operation'}
            autoFocus
            onInputKeyDown={() => setIsTyping(true)}
            onChange={(x) => {
                if (freeSolo) {
                    setExtraOption(x);
                    setIsTyping(false);
                }
            }}
            onSelect={(newValue: SearchOption) => {
                setIsTyping(false);
                onSelect(newValue?.value || '');
            }}
            defaultValue={{ label: value, value: value } as SearchOption}
            loading={isTyping}
            options={[
                ...filteredOptions.map((s) => ({
                    label: s,
                    value: s,
                })),
                ...(extraOption ? [extraOption] : []),
            ]}
            notFoundContent={<span>No recommendations found.</span>}
            labelInValue
            filterOption={false}
            onSearch={loadOptions}
            placeho
        />
    );
};

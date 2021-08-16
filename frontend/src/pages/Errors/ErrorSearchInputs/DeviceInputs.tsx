import React from 'react';
import { useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase, ValueType } from 'react-select';
import AsyncSelect from 'react-select/async';

import { useGetErrorFieldSuggestionQuery } from '../../../graph/generated/hooks';
import { ReactComponent as BrowserIcon } from '../../../static/browser.svg';
import { ReactComponent as OSIcon } from '../../../static/os.svg';
import inputStyles from '../../Sessions/SearchInputs/InputStyles.module.scss';
import { SharedSelectStyleProps } from '../../Sessions/SearchInputs/SearchInputUtil';
import { useErrorSearchContext } from '../ErrorSearchContext/ErrorSearchContext';

export const OperatingSystemInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useErrorSearchContext();

    const { refetch } = useGetErrorFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            organization_id: organization_id,
            query: input,
            name: 'os_name',
        });
        const suggestions = (fetched?.data?.error_field_suggestion ?? [])
            ?.map((e) => e?.value)
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((f) => {
                return { label: f, value: f };
            });
        return suggestions;
    };

    const onChange = (
        current: ValueType<{ label: string; value: string }, false>
    ) => {
        setSearchParams((params) => ({ ...params, os: current?.value }));
    };

    return (
        <div>
            <AsyncSelect
                placeholder={'Windows, Mac, Linux...'}
                isClearable
                cacheOptions
                value={
                    searchParams.os
                        ? { label: searchParams.os, value: searchParams.os }
                        : null
                }
                styles={SharedSelectStyleProps}
                loadOptions={generateOptions}
                components={{
                    DropdownIndicator: () => (
                        <div className={inputStyles.iconWrapper}>
                            <OSIcon />
                        </div>
                    ),
                    IndicatorSeparator: () => null,
                }}
                defaultOptions
                onChange={onChange}
            />
        </div>
    );
};

export const BrowserInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useErrorSearchContext();

    const { refetch } = useGetErrorFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            organization_id: organization_id,
            query: input,
            name: 'browser',
        });
        const suggestions =
            fetched?.data.error_field_suggestion
                ?.map((e) => e?.value)
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((f) => {
                    return { label: f, value: f };
                }) ?? [];
        return suggestions;
    };

    const onChange = (
        current: ValueType<{ label: string; value: string }, false>
    ) => {
        setSearchParams((params) => ({ ...params, browser: current?.value }));
    };

    return (
        <div>
            <AsyncSelect
                placeholder={'Chrome, Firefox, Safari...'}
                isClearable
                cacheOptions
                value={
                    searchParams.browser
                        ? {
                              label: searchParams.browser,
                              value: searchParams.browser,
                          }
                        : null
                }
                styles={SharedSelectStyleProps}
                components={{
                    DropdownIndicator: () => (
                        <div className={inputStyles.iconWrapper}>
                            <BrowserIcon />
                        </div>
                    ),
                    IndicatorSeparator: () => null,
                }}
                loadOptions={generateOptions}
                defaultOptions
                onChange={onChange}
            />
        </div>
    );
};

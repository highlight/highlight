import React from 'react';
import { useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase, ValueType } from 'react-select';
import AsyncSelect from 'react-select/async';

import { useGetFieldSuggestionQuery } from '../../../graph/generated/hooks';
import { ReactComponent as BrowserIcon } from '../../../static/browser.svg';
import { ReactComponent as OSIcon } from '../../../static/os.svg';
import { useSearchContext } from '../SearchContext/SearchContext';
import inputStyles from './InputStyles.module.scss';
import { SharedSelectStyleProps } from './SearchInputUtil';

export const OperatingSystemInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useSearchContext();

    const { refetch } = useGetFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            organization_id: organization_id,
            query: input,
            name: 'os_name',
        });
        const suggestions = (fetched?.data?.field_suggestion ?? [])
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
        <div className={inputStyles.commonInputWrapper}>
            <AsyncSelect
                placeholder={'Operating System'}
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
                            <OSIcon fill="#808080" />
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
    const { searchParams, setSearchParams } = useSearchContext();

    const { refetch } = useGetFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            organization_id: organization_id,
            query: input,
            name: 'browser_name',
        });
        const suggestions =
            fetched?.data.field_suggestion
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
        <div className={inputStyles.commonInputWrapper}>
            <AsyncSelect
                placeholder={'Browser'}
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
                            <BrowserIcon fill="#808080" />
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

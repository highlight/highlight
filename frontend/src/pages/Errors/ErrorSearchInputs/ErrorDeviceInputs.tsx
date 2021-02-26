import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase, ValueType } from 'react-select';
import { ErrorSearchContext } from '../ErrorSearchContext/ErrorSearchContext';
import AsyncSelect from 'react-select/async';
import { ReactComponent as OSIcon } from '../../../static/os.svg';
import { ReactComponent as BrowserIcon } from '../../../static/browser.svg';

import inputStyles from '../../Sessions/SearchInputs/InputStyles.module.scss';
import { SharedSelectStyleProps } from '../../Sessions/SearchInputs/SearchInputUtil';
import { useGetFieldSuggestionQuery } from '../../../graph/generated/hooks';

export const OperatingSystemInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { errorSearchParams, setErrorSearchParams } = useContext(
        ErrorSearchContext
    );

    const { refetch } = useGetFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            organization_id: organization_id,
            query: input,
            name: 'os_name',
        });
        const suggestions = (fetched?.data?.field_suggestionBETA ?? [])
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
        setErrorSearchParams((params) => ({ ...params, os: current?.value }));
    };

    return (
        <div className={inputStyles.commonInputWrapper}>
            <AsyncSelect
                placeholder={'Operating System'}
                isClearable
                cacheOptions
                value={
                    errorSearchParams.os
                        ? {
                              label: errorSearchParams.os,
                              value: errorSearchParams.os,
                          }
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
    const { errorSearchParams, setErrorSearchParams } = useContext(
        ErrorSearchContext
    );

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
            fetched?.data.field_suggestionBETA
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
        setErrorSearchParams((params) => ({
            ...params,
            browser: current?.value,
        }));
    };

    return (
        <div className={inputStyles.commonInputWrapper}>
            <AsyncSelect
                placeholder={'Browser'}
                isClearable
                cacheOptions
                value={
                    errorSearchParams.browser
                        ? {
                              label: errorSearchParams.browser,
                              value: errorSearchParams.browser,
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

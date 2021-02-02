import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase, ValueType } from 'react-select';
import { SearchContext } from '../SearchContext/SearchContext';
import AsyncCreatableSelect from 'react-select/async-creatable';
import AsyncSelect from 'react-select/async';
import inputStyles from './InputStyles.module.scss';
import { Switch } from 'antd';
import { ReactComponent as URLIcon } from '../../../static/link.svg';
import { ReactComponent as ReferrerIcon } from '../../../static/refer.svg';
import classNames from 'classnames/bind';
import { SharedSelectStyleProps } from './SearchInputUtil';
import { useGetFieldSuggestionQuery } from '../../../graph/generated/hooks';

export const VisitedUrlInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useContext(SearchContext);

    const { refetch } = useGetFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        var fetched = await refetch({
            organization_id: organization_id,
            query: input,
            name: 'visited-url',
        });
        var suggestions = (fetched?.data?.field_suggestionBETA ?? [])
            .map((e) => e?.value)
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((f) => {
                return { label: f, value: f };
            });
        return suggestions;
    };

    const onChange = (
        current: ValueType<{ label: string; value: string }, false>
    ) => {
        setSearchParams((params) => ({
            ...params,
            visited_url: current?.value,
        }));
    };

    const ContainsLabel = (inputValue: string) => {
        return 'Contains: ' + inputValue;
    };

    return (
        <div className={inputStyles.commonInputWrapper}>
            <AsyncCreatableSelect
                placeholder={'Visited URL'}
                styles={SharedSelectStyleProps}
                cacheOptions
                value={
                    searchParams.visited_url
                        ? {
                              label: searchParams.visited_url,
                              value: searchParams.visited_url,
                          }
                        : null
                }
                components={{
                    DropdownIndicator: () => (
                        <div className={inputStyles.iconWrapper}>
                            <URLIcon fill="#808080" />
                        </div>
                    ),
                    IndicatorSeparator: () => null,
                }}
                loadOptions={generateOptions}
                defaultOptions
                isClearable
                onChange={onChange}
                formatCreateLabel={ContainsLabel}
            />
        </div>
    );
};

export const ReferrerInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useContext(SearchContext);

    const { refetch } = useGetFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        var fetched = await refetch({
            organization_id: organization_id,
            query: input,
            name: 'referrer',
        });
        var suggestions = (fetched?.data?.field_suggestionBETA ?? [])
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
        setSearchParams((params) => ({ ...params, referrer: current?.value }));
    };

    return (
        <div className={inputStyles.commonInputWrapper}>
            <AsyncSelect
                placeholder={'Referrer'}
                cacheOptions
                isClearable
                value={
                    searchParams.referrer
                        ? {
                              label: searchParams.referrer,
                              value: searchParams.referrer,
                          }
                        : null
                }
                loadOptions={generateOptions}
                styles={SharedSelectStyleProps}
                components={{
                    DropdownIndicator: () => (
                        <div className={inputStyles.iconWrapper}>
                            <ReferrerIcon fill="#808080" />
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

export const ViewedSessionsSwitch = () => {
    const { searchParams, setSearchParams } = useContext(SearchContext);
    const [on, setOn] = useState(false);
    return (
        <div className={inputStyles.commonInputWrapper}>
            <div className={inputStyles.switchRow}>
                <Switch
                    checked={searchParams.hide_viewed || false}
                    onChange={(val: boolean) => {
                        setOn(val);
                        setSearchParams((params) => ({
                            ...params,
                            hide_viewed: val,
                        }));
                    }}
                />
                <div
                    className={classNames(
                        inputStyles.switchText,
                        on && inputStyles.switchTextSelected
                    )}
                >
                    Hide viewed sessions
                </div>
            </div>
        </div>
    );
};

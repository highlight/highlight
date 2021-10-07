import Select from '@components/Select/Select';
import SvgHashtagIcon from '@icons/HashtagIcon';
import SvgMapIcon from '@icons/MapIcon';
import { useParams } from '@util/react-router/useParams';
import { H } from 'highlight.run';
import React from 'react';
import { OptionsType, OptionTypeBase, ValueType } from 'react-select';
import AsyncSelect from 'react-select/async';

import {
    useGetAppVersionsQuery,
    useGetEnvironmentsQuery,
    useGetFieldSuggestionQuery,
} from '../../../graph/generated/hooks';
import SvgBrowser from '../../../static/Browser';
import SvgMonitorIcon from '../../../static/MonitorIcon';
import SvgOs from '../../../static/Os';
import { useSearchContext } from '../SearchContext/SearchContext';
import inputStyles from './InputStyles.module.scss';
import { SharedSelectStyleProps } from './SearchInputUtil';

export const OperatingSystemInput = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { searchParams, setSearchParams } = useSearchContext();

    const { refetch } = useGetFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            project_id,
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
        <div>
            <AsyncSelect
                placeholder="Mac, Windows, Linux..."
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
                            <SvgOs />
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
    const { project_id } = useParams<{ project_id: string }>();
    const { searchParams, setSearchParams } = useSearchContext();

    const { refetch } = useGetFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            project_id,
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
        <div>
            <AsyncSelect
                placeholder="Chrome, Firefox, Edge..."
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
                            <SvgBrowser />
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

export const DeviceIdInput = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { searchParams, setSearchParams } = useSearchContext();

    const { refetch } = useGetFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            project_id,
            query: input,
            name: 'device_id',
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
        setSearchParams((params) => ({ ...params, device_id: current?.value }));
        H.track('DeviceIDFilter');
    };

    return (
        <div>
            <AsyncSelect
                placeholder={'Device ID'}
                isClearable
                cacheOptions
                value={
                    searchParams.device_id
                        ? {
                              label: searchParams.device_id,
                              value: searchParams.device_id,
                          }
                        : null
                }
                styles={SharedSelectStyleProps}
                components={{
                    DropdownIndicator: () => (
                        <div className={inputStyles.iconWrapper}>
                            <SvgMonitorIcon className={inputStyles.fill} />
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

export const EnvironmentInput = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { searchParams, setSearchParams } = useSearchContext();

    const { data } = useGetEnvironmentsQuery({
        variables: {
            project_id,
        },
    });

    const onChange = (current: string[]) => {
        setSearchParams((params) => ({ ...params, environments: current }));
        H.track('EnvironmentsFilter');
    };

    return (
        <div className={inputStyles.selectWithIconContainer}>
            <Select
                className={inputStyles.select}
                mode="multiple"
                placeholder={'Environments'}
                value={searchParams.environments}
                options={(data?.environment_suggestion || []).map(
                    (suggestion) => ({
                        value: suggestion?.value || '',
                        displayValue: suggestion?.value || '',
                        id: suggestion?.value || '',
                    })
                )}
                onChange={onChange}
            />
            <SvgMapIcon className={inputStyles.icon} />
        </div>
    );
};

export const AppVersionInput = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { searchParams, setSearchParams } = useSearchContext();

    const { data } = useGetAppVersionsQuery({
        variables: {
            project_id,
        },
    });

    const onChange = (current: string[]) => {
        setSearchParams((params) => ({ ...params, app_versions: current }));
        H.track('AppVersionFilter');
    };

    return (
        <div className={inputStyles.selectWithIconContainer}>
            <Select
                className={inputStyles.select}
                mode="multiple"
                placeholder={'5.2.2, 4.3.1'}
                value={searchParams.app_versions}
                options={(data?.app_version_suggestion || []).map(
                    (suggestion) => ({
                        value: suggestion || '',
                        displayValue: suggestion || '',
                        id: suggestion || '',
                    })
                )}
                onChange={onChange}
            />
            <SvgHashtagIcon className={inputStyles.icon} />
        </div>
    );
};

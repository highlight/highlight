import { message } from 'antd';
import React, { useEffect } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase, ValueType } from 'react-select';
import AsyncCreatableSelect from 'react-select/async-creatable';

import { SearchMatchOption } from '../../../components/Option/Option';
import Switch from '../../../components/Switch/Switch';
import { useGetFieldSuggestionQuery } from '../../../graph/generated/hooks';
import { ReactComponent as URLIcon } from '../../../static/link.svg';
import { ReactComponent as ReferrerIcon } from '../../../static/refer.svg';
import { SessionPageSearchParams } from '../../Player/utils/utils';
import { useSearchContext } from '../SearchContext/SearchContext';
import { EmptySessionsSearchParams } from '../SessionsPage';
import inputStyles from './InputStyles.module.scss';
import { ContainsLabel, SharedSelectStyleProps } from './SearchInputUtil';

export const VisitedUrlInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useSearchContext();

    const { refetch } = useGetFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            organization_id: organization_id,
            query: input,
            name: 'visited-url',
        });
        const suggestions = (fetched?.data?.field_suggestion ?? [])
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
                    Option: (props) => <SearchMatchOption {...props} />,
                    IndicatorSeparator: () => null,
                }}
                loadOptions={generateOptions}
                defaultOptions
                isClearable
                onChange={onChange}
                formatCreateLabel={ContainsLabel}
                createOptionPosition={'first'}
            />
        </div>
    );
};

export const ReferrerInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useSearchContext();
    const location = useLocation();
    const history = useHistory();
    const referrerFromSearchParams = new URLSearchParams(location.search).get(
        SessionPageSearchParams.referrer
    );

    const { refetch } = useGetFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            organization_id: organization_id,
            query: input,
            name: 'referrer',
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
        setSearchParams((params) => ({ ...params, referrer: current?.value }));
    };

    useEffect(() => {
        if (referrerFromSearchParams) {
            setSearchParams(() => ({
                // We are explicitly clearing any existing search params so the only applied search param is the referrer.
                ...EmptySessionsSearchParams,
                referrer: referrerFromSearchParams,
            }));
            message.success(
                `Showing sessions that were referred by ${referrerFromSearchParams}`
            );
            history.replace({ search: '' });
        }
    }, [history, referrerFromSearchParams, setSearchParams]);

    return (
        <div className={inputStyles.commonInputWrapper}>
            <AsyncCreatableSelect
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
                    Option: (props) => <SearchMatchOption {...props} />,
                    IndicatorSeparator: () => null,
                }}
                defaultOptions
                onChange={onChange}
                formatCreateLabel={ContainsLabel}
                createOptionPosition={'first'}
            />
        </div>
    );
};

export const ViewedSessionsSwitch = () => {
    const { searchParams, setSearchParams } = useSearchContext();

    return (
        <Switch
            label="Hide viewed sessions"
            checked={searchParams.hide_viewed}
            onChange={(val: boolean) => {
                setSearchParams((params) => ({
                    ...params,
                    hide_viewed: val,
                }));
            }}
        />
    );
};

export const LiveSessionsSwitch = () => {
    const { hideLiveSessions, setHideLiveSessions } = useSearchContext();

    return (
        <Switch
            checked={hideLiveSessions}
            onChange={(val: boolean) => {
                setHideLiveSessions(val);
            }}
            label="Hide live sessions"
        />
    );
};

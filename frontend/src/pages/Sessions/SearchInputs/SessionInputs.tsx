import { Checkbox } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase, ValueType } from 'react-select';
import AsyncCreatableSelect from 'react-select/async-creatable';

import { SearchMatchOption } from '../../../components/Option/Option';
import { useGetFieldSuggestionQuery } from '../../../graph/generated/hooks';
import SvgLinkIcon from '../../../static/LinkIcon';
import SvgReferrer from '../../../static/Referrer';
import { useSearchContext } from '../SearchContext/SearchContext';
import { LIVE_SEGMENT_ID } from '../SearchSidebar/SegmentPicker/SegmentPicker';
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
        <div>
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
                            <SvgLinkIcon />
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

    return (
        <div>
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
                            <SvgReferrer />
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
        <Checkbox
            checked={searchParams.hide_viewed}
            onChange={(e) => {
                setSearchParams((params) => ({
                    ...params,
                    hide_viewed: e.target.checked,
                }));
            }}
            className={
                searchParams.hide_viewed ? '' : inputStyles.checkboxUnselected
            }
        >
            Hide viewed sessions
        </Checkbox>
    );
};

export const LiveSessionsSwitch = () => {
    const { searchParams, setSearchParams } = useSearchContext();
    const { segment_id } = useParams<{
        segment_id: string;
    }>();

    const isOnLiveSegment = segment_id === LIVE_SEGMENT_ID;

    return (
        <Checkbox
            disabled={isOnLiveSegment}
            checked={isOnLiveSegment ? true : searchParams.show_live_sessions}
            onChange={(e) => {
                setSearchParams((params) => ({
                    ...params,
                    show_live_sessions: e.target.checked,
                }));
            }}
            className={
                searchParams.show_live_sessions
                    ? ''
                    : inputStyles.checkboxUnselected
            }
        >
            Show live sessions
        </Checkbox>
    );
};

import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase, ValueType } from 'react-select';
import { SearchContext } from '../SearchContext/SearchContext';
import AsyncSelect from 'react-select/async';
import { gql, useQuery } from '@apollo/client';
import inputStyles from './InputStyles.module.scss';
import { ReactComponent as URLIcon } from '../../../static/link.svg';
import { ReactComponent as ReferrerIcon } from '../../../static/refer.svg';
import { SharedSelectStyleProps } from './SearchInputUtil';

export const VisitedUrlInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { setSearchParams } = useContext(SearchContext);

    const { refetch } = useQuery<{ field_suggestionBETA: Array<{ name: string; value: string }> }, { organization_id: number; query: string; name: string }>(
        gql`
            query GetFieldSuggestionBETA($organization_id: ID!, $name: String!, $query: String!) {
                field_suggestionBETA(organization_id: $organization_id, name: $name, query: $query) {
                    name
                    value
                }
            }
        `, { skip: true });

    const generateOptions = async (input: string): Promise<OptionsType<OptionTypeBase> | void[]> => {
        var fetched = await refetch({ organization_id: parseInt(organization_id), query: input, name: "visited-url" })
        var suggestions = fetched.data.field_suggestionBETA
            .map(e => e.value)
            .filter((v, i, a) => a.indexOf(v) === i)
            .map(f => { return { label: f, value: f } });
        return suggestions;
    }

    const onChange = (current: ValueType<{ label: string; value: string }, false>) => {
        setSearchParams(params => ({ ...params, visited_url: current?.value }))
    }

    return (
        <div className={inputStyles.commonInputWrapper}>
            <AsyncSelect
                placeholder={"Visited URL"}
                styles={SharedSelectStyleProps}
                cacheOptions
                components={{ DropdownIndicator: () => <div className={inputStyles.iconWrapper}><URLIcon fill="#808080" /></div>, IndicatorSeparator: () => null }}
                loadOptions={generateOptions}
                defaultOptions
                isClearable
                onChange={onChange}
            />
        </div>
    );
}

export const ReferrerInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { setSearchParams } = useContext(SearchContext);

    const { refetch } = useQuery<{ field_suggestionBETA: Array<{ name: string; value: string }> }, { organization_id: number; query: string; name: string }>(
        gql`
            query GetFieldSuggestionBETA($organization_id: ID!, $name: String!, $query: String!) {
                field_suggestionBETA(organization_id: $organization_id, name: $name, query: $query) {
                    name
                    value
                }
            }
        `, { skip: true });

    const generateOptions = async (input: string): Promise<OptionsType<OptionTypeBase> | void[]> => {
        var fetched = await refetch({ organization_id: parseInt(organization_id), query: input, name: "referrer" })
        var suggestions = fetched.data.field_suggestionBETA
            .map(e => e.value)
            .filter((v, i, a) => a.indexOf(v) === i)
            .map(f => { return { label: f, value: f } });
        return suggestions;
    }

    const onChange = (current: ValueType<{ label: string; value: string }, false>) => {
        setSearchParams(params => ({ ...params, referrer: current?.value }))
    }

    return (
        <div className={inputStyles.commonInputWrapper}>
            <AsyncSelect
                placeholder={"Referrer"}
                cacheOptions
                isClearable
                loadOptions={generateOptions}
                styles={SharedSelectStyleProps}
                components={{ DropdownIndicator: () => <div className={inputStyles.iconWrapper}><ReferrerIcon fill="#808080" /></div>, IndicatorSeparator: () => null }}
                defaultOptions
                onChange={onChange}
            />
        </div >
    );
}
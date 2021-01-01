import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase, ValueType } from 'react-select';
import { SearchContext, SearchParams, UserProperty } from '../SearchContext/SearchContext';
import AsyncSelect from 'react-select/async';
import { gql, useQuery } from '@apollo/client';

export const OperatingSystemInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useContext(SearchContext);

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
        var fetched = await refetch({ organization_id: parseInt(organization_id), query: input, name: "os_name" })
        var suggestions = fetched.data.field_suggestionBETA.
            map(e => e.value).
            filter((v, i, a) => a.indexOf(v) === i).
            map(f => { return { label: f, value: f } });
        console.log(suggestions);
        return suggestions;
    }

    const onChange = (current: ValueType<{ label: string; value: string }, false>) => {
        setSearchParams(params => ({ ...params, os: current?.value }))
    }

    return (
        <AsyncSelect
            placeholder={"Operating System"}
            cacheOptions
            loadOptions={generateOptions}
            defaultOptions
            onChange={onChange}
        />
    );
}

export const BrowserInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useContext(SearchContext);

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
        var fetched = await refetch({ organization_id: parseInt(organization_id), query: input, name: "browser_name" })
        var suggestions = fetched.data.field_suggestionBETA.
            map(e => e.value).
            filter((v, i, a) => a.indexOf(v) === i).
            map(f => { return { label: f, value: f } });
        return suggestions;
    }

    const onChange = (current: ValueType<{ label: string; value: string }, false>) => {
        setSearchParams(params => ({ ...params, browser: current?.value }))
    }

    return (
        <AsyncSelect
            placeholder={"Browser"}
            cacheOptions
            loadOptions={generateOptions}
            defaultOptions
            onChange={onChange}
        />
    );
}
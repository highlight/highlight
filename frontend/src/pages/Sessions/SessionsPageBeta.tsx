import React, { useRef, useState, useEffect, useContext } from 'react';

import { useParams, Link } from 'react-router-dom';
import { useLazyQuery, gql, useQuery } from '@apollo/client';
import { MillisToMinutesAndSecondsVerbose } from '../../util/time';
import { ReactComponent as PlayButton } from '../../static/play-button.svg';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useDebouncedCallback } from 'use-debounce';
import { IntegrationCard } from './IntegrationCard/IntegrationCard';
import {
    Value,
    SearchParam,
    OptionsFilter,
    DateOptions,
    FieldOptions,
} from './OptionsRender';
import { Spinner } from '../../components/Spinner/Spinner';

import AutosizeInput from 'react-input-autosize';

import styles from './SessionsPage.module.scss';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';
import classNames from 'classnames/bind';
import { SearchSidebar } from './SearchSidebar/SearchSidebar';
import AsyncSelect from 'react-select/async';
import { OptionsType, OptionTypeBase } from 'react-select';
import { SearchContext, SearchParams, UserProperty } from './SearchContext/SearchContext';

export const SessionsPageBeta = ({ integrated }: { integrated: boolean }) => {
    const [searchParams, setSearchParams] = useState<SearchParams>({ userProperties: [] });
    const [openSidebar, setOpenSidebar] = useState<boolean>(false);
    return (
        <SearchContext.Provider value={{ searchParams, setSearchParams }}>
            <div className={styles.sessionsBody}>
                <div className={styles.sessionsSection}>
                    <UserPropertySearch />
                    <button onClick={() => setOpenSidebar(!openSidebar)}>Advanced Search</button>
                </div>
                <SearchSidebar open={openSidebar} />
            </div>
        </SearchContext.Provider >
    );
};


const UserPropertySearch = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useContext(SearchContext);

    const { refetch } = useQuery<{ user_field_suggestion: Array<{ name: string; value: string }> }, { organization_id: number; query: string }>(
        gql`
            query GetUserFieldSuggestion($organization_id: ID!, $query: String!) {
                user_field_suggestion(organization_id: $organization_id, query: $query) {
                    name
                    value
                }
            }
        `, { skip: true });

    const generateOptions = async (input: string): Promise<OptionsType<OptionTypeBase> | void[]> => {
        var fetched = await refetch({ organization_id: parseInt(organization_id), query: input })
        var suggestions = fetched.data.user_field_suggestion.map(f => { return { label: f.name + ": " + f.value, value: f.value, name: f.name } });
        return suggestions;
    }

    return (
        <AsyncSelect
            isMulti
            cacheOptions
            defaultOptions
            onChange={(options) => {
                var newOptions: Array<UserProperty> = options?.map(o => {
                    return { name: o.name, value: o.value }
                }) ?? [];
                setSearchParams((params: SearchParams) => {
                    return { ...params, userProperties: newOptions }
                })
            }}
            value={searchParams.userProperties.map(p => { return { label: p.name + ": " + p.value, value: p.value, name: p.name } })}
            loadOptions={generateOptions}
        />
    );
}
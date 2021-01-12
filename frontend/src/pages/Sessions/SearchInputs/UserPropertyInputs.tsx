import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase } from 'react-select';
import { SearchContext, SearchParams, UserProperty } from '../SearchContext/SearchContext';
import AsyncSelect from 'react-select/async';
import { gql, useQuery } from '@apollo/client';
import { Switch } from 'antd';
import inputStyles from './InputStyles.module.scss'
import { ReactComponent as UserIcon } from '../../../static/user.svg';
import { useState } from 'react';
import classNames from 'classnames/bind';

export const UserPropertyInput = ({include}:{include: boolean}) => {
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
        <div className={inputStyles.commonInputWrapper}>
            <AsyncSelect
                isMulti
                styles={{
                    control: (provided, state) => ({ ...provided, borderColor: "#eaeaea", borderRadius: 8, minHeight: 45 }),
                    multiValue: (provided, state) => ({ ...provided, backgroundColor: '#F2EEFB' }),
                }}
                cacheOptions
                placeholder={"Select a property..."}
                isClearable={false}
                defaultOptions
                onChange={(options) => {
                    var newOptions: Array<UserProperty> = options?.map(o => {
                        return { name: o.name, value: o.value }
                    }) ?? [];
                    if(include){
                        setSearchParams((params: SearchParams) => {
                            return { ...params, user_properties: newOptions }
                        })  
                    }
                    else{
                        setSearchParams((params: SearchParams) => {
                            return { ...params, excluded_properties: newOptions }
                        })
                    }
                    
                }}
                value={
                    include ?
                    searchParams?.user_properties?.map(p => { return { label: p.name + ": " + p.value, value: p.value, name: p.name } })
                    : searchParams?.excluded_properties?.map(p => { return { label: p.name + ": " + p.value, value: p.value, name: p.name } })
                }
                loadOptions={generateOptions}
                components={{ DropdownIndicator: () => <div className={inputStyles.iconWrapper}><UserIcon fill="#808080" /></div>, IndicatorSeparator: () => null }}
            />
        </div>
    );
}

export const IdentifiedUsersSwitch = () => {
    const { setSearchParams } = useContext(SearchContext);
    const [on, setOn] = useState(false)
    return (
        <div className={inputStyles.commonInputWrapper}>
            <div className={inputStyles.switchRow}>
                <Switch
                    onChange={(val: boolean) => {
                        setOn(val)
                        setSearchParams(params => ({ ...params, identified: val }))
                    }}
                />
                <div className={classNames(inputStyles.switchText, on && inputStyles.switchTextSelected)}>Only show identified users</div>
            </div>
        </div>
    );
}
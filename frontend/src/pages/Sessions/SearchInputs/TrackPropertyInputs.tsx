import React from 'react';
import { useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase } from 'react-select';
import {
    SearchParams,
    UserProperty,
    useSearchContext,
} from '../SearchContext/SearchContext';

import AsyncCreatableSelect from 'react-select/async-creatable';
import inputStyles from './InputStyles.module.scss';
import { ReactComponent as UserIcon } from '../../../static/user.svg';
import { ContainsLabel } from './SearchInputUtil';
import { useGetTrackSuggestionQuery } from '../../../graph/generated/hooks';
import { PropertyOption } from '../../../components/Option/Option';

export const TrackPropertyInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useSearchContext();

    const { refetch } = useGetTrackSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            organization_id,
            query: input,
        });
        const suggestions = (fetched?.data?.property_suggestion ?? []).map(
            (f) => {
                return {
                    label: f?.name + ': ' + f?.value,
                    value: f?.value,
                    name: f?.name,
                };
            }
        );
        return suggestions;
    };

    return (
        <div className={inputStyles.commonInputWrapper}>
            <AsyncCreatableSelect
                isMulti
                styles={{
                    control: (provided) => ({
                        ...provided,
                        borderColor: 'var(--color-gray-300)',
                        borderRadius: 8,
                        minHeight: 45,
                    }),
                    multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: 'var(--color-purple-100)',
                    }),
                }}
                cacheOptions
                placeholder={'Select a property...'}
                isClearable={false}
                defaultOptions
                onChange={(options) => {
                    const newOptions: Array<UserProperty> =
                        options?.map((o) => {
                            if (!o.name) o.name = 'contains';
                            return { name: o.name, value: o.value };
                        }) ?? [];
                    setSearchParams((params: SearchParams) => {
                        return { ...params, track_properties: newOptions };
                    });
                }}
                value={searchParams?.track_properties?.map((p) => {
                    return {
                        label: p.name + ': ' + p.value,
                        value: p.value,
                        name: p.name,
                    };
                })}
                loadOptions={generateOptions}
                components={{
                    DropdownIndicator: () => (
                        <div className={inputStyles.iconWrapper}>
                            <UserIcon fill="var(--color-gray-500)" />
                        </div>
                    ),
                    Option: (props) => <PropertyOption {...props} />,
                    IndicatorSeparator: () => null,
                }}
                formatCreateLabel={ContainsLabel}
                createOptionPosition={'first'}
            />
        </div>
    );
};

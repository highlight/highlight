import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase } from 'react-select';
import {
    SearchContext,
    SearchParams,
    UserProperty,
} from '../SearchContext/SearchContext';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { Switch } from 'antd';
import inputStyles from './InputStyles.module.scss';
import { ReactComponent as UserIcon } from '../../../static/user.svg';
import classNames from 'classnames/bind';
import { ContainsLabel } from './SearchInputUtil';
import { useGetUserSuggestionQuery } from '../../../graph/generated/hooks';
import { PropertyOption } from '../../../components/Option/Option';

export const UserPropertyInput = ({ include }: { include: boolean }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useContext(SearchContext);

    const { refetch } = useGetUserSuggestionQuery({ skip: true });

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
        <div
            className={`${inputStyles.commonInputWrapper} ${inputStyles.searchInput}`}
        >
            <AsyncCreatableSelect
                isMulti
                styles={{
                    control: (provided) => ({
                        ...provided,
                        borderColor: '#eaeaea',
                        borderRadius: 8,
                        minHeight: 45,
                    }),
                    multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: '#F2EEFB',
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
                    if (include) {
                        setSearchParams((params: SearchParams) => {
                            return { ...params, user_properties: newOptions };
                        });
                    } else {
                        setSearchParams((params: SearchParams) => {
                            return {
                                ...params,
                                excluded_properties: newOptions,
                            };
                        });
                    }
                }}
                value={
                    include
                        ? searchParams?.user_properties?.map((p) => {
                              return {
                                  label: p.name + ': ' + p.value,
                                  value: p.value,
                                  name: p.name,
                              };
                          })
                        : searchParams?.excluded_properties?.map((p) => {
                              return {
                                  label: p.name + ': ' + p.value,
                                  value: p.value,
                                  name: p.name,
                              };
                          })
                }
                loadOptions={generateOptions}
                components={{
                    DropdownIndicator: () => (
                        <div className={inputStyles.iconWrapper}>
                            <UserIcon fill="#808080" />
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

export const IdentifiedUsersSwitch = () => {
    const { searchParams, setSearchParams } = useContext(SearchContext);

    return (
        <div className={inputStyles.switchRow}>
            <Switch
                checked={searchParams.identified}
                onChange={(val: boolean) => {
                    setSearchParams((params) => ({
                        ...params,
                        identified: val,
                    }));
                }}
            />
            <label
                className={classNames(inputStyles.switchText, {
                    [inputStyles.switchTextSelected]: searchParams.identified,
                })}
            >
                <span className={inputStyles.switchSpan}>
                    Only show identified users
                </span>
            </label>
        </div>
    );
};

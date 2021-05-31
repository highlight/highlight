import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import React from 'react';
import { useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase } from 'react-select';
import AsyncCreatableSelect from 'react-select/async-creatable';

import { PropertyOption } from '../../../components/Option/Option';
import Tooltip from '../../../components/Tooltip/Tooltip';
import { useGetUserSuggestionQuery } from '../../../graph/generated/hooks';
import { ReactComponent as UserIcon } from '../../../static/user.svg';
import { SessionPageSearchParams } from '../../Player/utils/utils';
import {
    SearchParams,
    UserProperty,
    useSearchContext,
} from '../SearchContext/SearchContext';
import { EmptySessionsSearchParams } from '../SessionsPage';
import useWatchSessionPageSearchParams from './hooks/useWatchSessionPageSearchParams';
import inputStyles from './InputStyles.module.scss';
import { ContainsLabel } from './SearchInputUtil';

export const UserPropertyInput = ({ include }: { include: boolean }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useSearchContext();

    useWatchSessionPageSearchParams(
        SessionPageSearchParams.identifier,
        (value) => ({
            // We are explicitly clearing any existing search params so the only applied search param is the identifier.
            ...EmptySessionsSearchParams,
            user_properties: [
                {
                    name: 'identifier',
                    value,
                },
            ],
        }),
        (value) => `Showing sessions for ${value}`
    );

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
    const { searchParams, setSearchParams } = useSearchContext();

    return (
        <div>
            <Checkbox
                checked={searchParams.identified}
                onChange={(e: CheckboxChangeEvent) => {
                    setSearchParams((params) => ({
                        ...params,
                        identified: e.target.checked,
                    }));
                }}
            >
                <span
                    className={
                        searchParams.identified
                            ? ''
                            : inputStyles.checkboxUnselected
                    }
                >
                    Only show identified users
                </span>
            </Checkbox>
        </div>
    );
};

export const FirstTimeUsersSwitch = () => {
    const { searchParams, setSearchParams } = useSearchContext();
    useWatchSessionPageSearchParams(
        SessionPageSearchParams.firstTimeUsers,
        () => ({ ...EmptySessionsSearchParams, first_time: true }),
        () => `Showing sessions for new users`
    );

    return (
        <div>
            <Tooltip
                title="Show only your user's first recorded session"
                placement="left"
            >
                <Checkbox
                    checked={searchParams.first_time}
                    onChange={(e: CheckboxChangeEvent) => {
                        setSearchParams((params) => ({
                            ...params,
                            first_time: e.target.checked,
                        }));
                    }}
                >
                    <span
                        className={
                            searchParams.first_time
                                ? ''
                                : inputStyles.checkboxUnselected
                        }
                    >
                        Only show new users
                    </span>
                </Checkbox>
            </Tooltip>
        </div>
    );
};

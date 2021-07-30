import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { OptionsType, OptionTypeBase, ValueType } from 'react-select';
import AsyncCreatableSelect from 'react-select/async-creatable';

import { SearchMatchOption } from '../../../components/Option/Option';
import Switch from '../../../components/Switch/Switch';
import { useGetErrorFieldSuggestionQuery } from '../../../graph/generated/hooks';
import { ReactComponent as ErrorsIcon } from '../../../static/errors-icon.svg';
import inputStyles from '../../Sessions/SearchInputs/InputStyles.module.scss';
import {
    ContainsLabel,
    SharedSelectStyleProps,
} from '../../Sessions/SearchInputs/SearchInputUtil';
import { ErrorSearchContext } from '../ErrorSearchContext/ErrorSearchContext';

export const EventInput = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { searchParams, setSearchParams } = useContext(ErrorSearchContext);

    const { refetch } = useGetErrorFieldSuggestionQuery({ skip: true });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            organization_id: organization_id,
            query: input,
            name: 'event',
        });
        const suggestions = (fetched?.data?.error_field_suggestion ?? [])
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
            event: current?.value,
        }));
    };

    return (
        <div>
            <AsyncCreatableSelect
                placeholder={'Search error...'}
                styles={SharedSelectStyleProps}
                cacheOptions
                value={
                    searchParams.event
                        ? {
                              label: searchParams.event,
                              value: searchParams.event,
                          }
                        : null
                }
                components={{
                    DropdownIndicator: () => (
                        <div className={inputStyles.iconWrapper}>
                            <ErrorsIcon fill="#808080" />
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

export const ResolvedErrorSwitch = () => {
    const { searchParams, setSearchParams } = useContext(ErrorSearchContext);

    return (
        <Switch
            checked={searchParams.hide_resolved}
            onChange={(val: boolean) => {
                setSearchParams((params) => ({
                    ...params,
                    hide_resolved: val,
                }));
            }}
            label="Hide resolved errors"
        />
    );
};

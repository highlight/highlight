import React, { useState } from 'react';
import Highlighter from 'react-highlight-words';
import { useParams } from 'react-router-dom';
import { components, OptionsType, OptionTypeBase } from 'react-select';
import AsyncSelect from 'react-select/async';

import { useGetSessionSearchResultsQuery } from '../../../../../graph/generated/hooks';
import SvgSearchIcon from '../../../../../static/SearchIcon';
import styles from './SessionSearch.module.scss';

const SessionSearch = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const [query, setQuery] = useState('');

    const handleChange = (value: any) => {
        console.log(`selected ${value}`);
    };

    const { loading, data, refetch } = useGetSessionSearchResultsQuery({
        variables: {
            organization_id,
            query: '',
        },
    });

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            organization_id,
            query: input,
        });

        return getSuggestions(fetched.data);
    };

    return (
        <AsyncSelect
            isMulti
            cacheOptions
            loadOptions={generateOptions}
            isLoading={loading}
            isClearable={false}
            onChange={handleChange}
            className={styles.select}
            onInputChange={(newValue, actionMeta) => {
                // We need access to the search value outside of the AsyncSelect component so we reflect the value to state.
                if (actionMeta?.action === 'input-change') {
                    setQuery(newValue);
                } else {
                    setQuery('');
                }
            }}
            components={{
                DropdownIndicator: () => (
                    <SvgSearchIcon className={styles.searchIcon} />
                ),
                IndicatorSeparator: null,
                MultiValueLabel: ({ ...props }) => {
                    return (
                        <span {...props} className={styles.valueLabel}>
                            {props.data.valueType}: {props.data.name}
                        </span>
                    );
                },
                Option: (props) => {
                    const {
                        data: { name, valueType },
                    } = props;

                    return (
                        <div>
                            <components.Option {...props}>
                                <div>
                                    {name && (
                                        <span
                                            className={
                                                styles.optionLabelContainer
                                            }
                                        >
                                            <span>
                                                <Highlighter
                                                    highlightClassName="YourHighlightClass"
                                                    searchWords={query.split(
                                                        ' '
                                                    )}
                                                    autoEscape={true}
                                                    textToHighlight={name}
                                                />
                                                {/* {name} */}
                                            </span>
                                            <span className={styles.keyLabel}>
                                                {valueType}
                                            </span>
                                        </span>
                                    )}
                                </div>
                            </components.Option>
                        </div>
                    );
                },
            }}
            styles={{
                control: (provided) => ({
                    ...provided,
                    borderColor: 'var(--color-gray-300)',
                    borderRadius: 'var(--border-radius)',
                    minHeight: 45,
                }),
                multiValue: (provided) => ({
                    ...provided,
                    backgroundColor: 'var(--color-purple-100)',
                }),
                group: (provided) => ({
                    ...provided,
                    paddingTop: 0,
                    '&:first-of-type > :first-of-type': {
                        borderTop: 'none',
                    },
                }),
                groupHeading: (provided) => ({
                    ...provided,
                    color: 'var(--color-purple)',
                    fontSize: 12,
                    fontWeight: 400,
                    textTransform: 'none',
                    borderBottom: '1px solid var(--color-gray-300)',
                    borderTop: '1px solid var(--color-gray-300)',
                    paddingBottom: 'var(--size-xxSmall)',
                    paddingTop: 'var(--size-xSmall)',
                }),
                menuList: (provided) => ({
                    ...provided,
                    paddingTop: 0,
                }),
                menu: (provided) => ({
                    ...provided,
                    borderRadius: 'var(--border-radius)',
                    borderColor: 'var(--color-gray-300)',
                    boxShadow: 'var(--box-shadow-2)',
                    fontFamily: 'var(--header-font-family)',
                }),
            }}
            isSearchable
            defaultOptions={getSuggestions(data, 3)}
            // menuIsOpen
        />
    );
};

export default SessionSearch;

interface SessionSearchOption {
    valueType: string;
    name: string;
    id: string;
    value: string;
}

interface Suggestion {
    id: string;
    name: string;
    value: string;
}

const transformToOption = ({
    id,
    name,
    value,
}: Suggestion): SessionSearchOption => ({
    id,
    valueType: name,
    name: value,
    value: `${name}:${value}`,
});

const getSuggestions = (data: any, limitResultsCount?: number) => {
    const trackProperties = data
        ?.trackProperties!.map((suggestion: Suggestion) =>
            transformToOption(suggestion)
        )
        .slice(0, limitResultsCount);
    const userProperties = data
        ?.userProperties!.map((suggestion: Suggestion) =>
            transformToOption(suggestion)
        )
        .slice(0, limitResultsCount);
    const visitedUrls = data
        ?.visitedUrls!.map((suggestion: Suggestion) =>
            transformToOption(suggestion)
        )
        .slice(0, limitResultsCount);
    const referrers = data
        ?.referrers!.map((suggestion: Suggestion) =>
            transformToOption(suggestion)
        )
        .slice(0, limitResultsCount);

    return [
        {
            label: 'Track Properties',
            options: trackProperties,
        },
        {
            label: 'User Properties',
            options: userProperties,
        },
        {
            label: 'Visited URLs',
            options: visitedUrls,
        },
        {
            label: 'Referrers',
            options: referrers,
        },
    ];
};

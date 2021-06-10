import React, { useEffect, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { useParams } from 'react-router-dom';
import { components, OptionsType, OptionTypeBase } from 'react-select';
import AsyncSelect from 'react-select/async';

import { useGetSessionSearchResultsQuery } from '../../../../../graph/generated/hooks';
import useSelectedSessionSearchFilters from '../../../../../persistedStorage/useSelectedSessionSearchFilters';
import SvgSearchIcon from '../../../../../static/SearchIcon';
import {
    UserProperty,
    useSearchContext,
} from '../../../SearchContext/SearchContext';
import SessionSearchFilters from './components/SessionSearchFilters/SessionSearchFilters';
import styles from './SessionSearch.module.scss';

const SessionSearch = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const [query, setQuery] = useState('');
    const [selectedProperties, setSelectedProperties] = useState<
        SessionSearchOption[]
    >([]);
    const { searchParams, setSearchParams } = useSearchContext();
    const { selectedSearchFilters } = useSelectedSessionSearchFilters();

    const handleChange = (_selectedProperties: any) => {
        setSelectedProperties(_selectedProperties);
        const selectedProperties = _selectedProperties as SessionSearchOption[];

        const newSearchParams: {
            userProperties: UserProperty[];
            trackProperties: UserProperty[];
            visitedUrls: string[];
            referrers: string[];
        } = {
            userProperties: [],
            trackProperties: [],
            visitedUrls: [],
            referrers: [],
        };
        selectedProperties?.forEach(({ apiType, id, name, value }) => {
            switch (apiType) {
                case 'userProperties':
                    newSearchParams.userProperties.push({
                        id,
                        name,
                        value,
                    });
                    break;
                case 'trackProperties':
                    newSearchParams.trackProperties.push({
                        id,
                        name,
                        value,
                    });
                    break;
                case 'visitedUrls':
                    newSearchParams.visitedUrls.push(name);
                    break;
                case 'referrers':
                    newSearchParams.referrers.push(name);
                    break;
            }
        });

        setSearchParams((params) => ({
            ...params,
            track_properties: newSearchParams.trackProperties,
            user_properties: newSearchParams.userProperties,
            referrer:
                newSearchParams.referrers.length > 0
                    ? newSearchParams.referrers[0]
                    : undefined,
            visited_url:
                newSearchParams.visitedUrls.length > 0
                    ? newSearchParams.visitedUrls[0]
                    : undefined,
        }));
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

        return getSuggestions(fetched.data, selectedSearchFilters, 3);
    };

    useEffect(() => {
        if (searchParams) {
            const userProperties = (
                searchParams.user_properties || []
            ).map((property) => transformToOption(property, 'userProperties'));
            const trackProperties = (
                searchParams.track_properties || []
            ).map((property) => transformToOption(property, 'trackProperties'));
            const visitedUrl =
                (searchParams.visited_url?.length || 0) > 0
                    ? searchParams.visited_url
                    : undefined;
            const referrer =
                (searchParams.referrer?.length || 0) > 0
                    ? searchParams.referrer
                    : undefined;

            const selectedValues: SessionSearchOption[] = [
                ...userProperties,
                ...trackProperties,
            ];

            if (visitedUrl) {
                selectedValues.push({
                    apiType: 'visitedUrls',
                    id: visitedUrl,
                    name: visitedUrl,
                    value: `visitedUrl:${visitedUrl}`,
                    valueType: 'visitedUrl',
                });
            }
            if (referrer) {
                selectedValues.push({
                    apiType: 'referrers',
                    id: referrer,
                    name: referrer,
                    value: `referrer:${referrer}`,
                    valueType: 'referrer',
                });
            }

            setSelectedProperties(selectedValues);
        }
    }, [searchParams]);

    return (
        <AsyncSelect
            isMulti
            loadOptions={generateOptions}
            isLoading={loading}
            isClearable={false}
            onChange={handleChange}
            className={styles.select}
            value={selectedProperties}
            placeholder="Search for a property..."
            noOptionsMessage={({ inputValue }) =>
                `No results for ${inputValue}`
            }
            onInputChange={(newValue, actionMeta) => {
                // We need access to the search value outside of the AsyncSelect component so we reflect the value to state.
                if (actionMeta?.action === 'input-change') {
                    setQuery(newValue);
                } else {
                    setQuery('');
                }
            }}
            components={{
                LoadingIndicator: null,
                DropdownIndicator: () => (
                    <SvgSearchIcon className={styles.searchIcon} />
                ),
                IndicatorSeparator: null,
                MultiValueLabel: ({
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    innerProps,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    selectedProps,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    selectProps,
                    ...props
                }) => {
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
                                            <Highlighter
                                                className={styles.nameLabel}
                                                highlightClassName={
                                                    styles.highlightedFuzzyMatch
                                                }
                                                searchWords={query.split(' ')}
                                                autoEscape={true}
                                                textToHighlight={name}
                                            />
                                            <Highlighter
                                                className={styles.keyLabel}
                                                highlightClassName={
                                                    styles.highlightedFuzzyMatch
                                                }
                                                searchWords={query.split(' ')}
                                                autoEscape={true}
                                                textToHighlight={valueType}
                                            />
                                        </span>
                                    )}
                                </div>
                            </components.Option>
                        </div>
                    );
                },
                Menu: (props) => {
                    return (
                        <components.Menu {...props}>
                            <>
                                <div className={styles.filterContainer}>
                                    <h4>Includes:</h4>
                                    <SessionSearchFilters />
                                </div>
                                {props.children}
                            </>
                        </components.Menu>
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
                    paddingBottom: 0,
                }),
                groupHeading: (provided) => ({
                    ...provided,
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    fontWeight: 400,
                    textTransform: 'none',
                    marginBottom: 0,
                    borderBottom: '1px solid var(--color-gray-300)',
                    borderTop: '1px solid var(--color-gray-300)',
                    paddingBottom: 'var(--size-xSmall)',
                    paddingTop: 'var(--size-xSmall)',
                    background: 'var(--color-gray-200)',
                }),
                menuList: (provided) => ({
                    ...provided,
                    paddingTop: 0,
                    paddingBottom: 0,
                }),
                menu: (provided) => ({
                    ...provided,
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--color-gray-300)',
                    boxShadow: 'var(--box-shadow-2)',
                    fontFamily: 'var(--header-font-family)',
                }),
            }}
            isSearchable
            defaultOptions={getSuggestions(data, selectedSearchFilters, 3)}
            maxMenuHeight={600}
        />
    );
};

export default SessionSearch;

/**
 * The session properties that support search.
 */
type API_TYPES =
    | 'trackProperties'
    | 'userProperties'
    | 'visitedUrls'
    | 'referrers';

interface SessionSearchOption {
    valueType: string;
    name: string;
    id: string;
    value: string;
    apiType: API_TYPES;
}

interface Suggestion {
    id: string;
    name: string;
    value: string;
}

const transformToOption = (
    { id, name, value }: Suggestion,
    apiType: API_TYPES
): SessionSearchOption => {
    const valueToUse = value;

    if (valueToUse.split(':').length === 2) {
        const [value, name] = valueToUse.split(':');
        return {
            id,
            valueType: value,
            name,
            value: valueToUse,
            apiType,
        };
    }

    return {
        id,
        valueType: name,
        name: value,
        value: `${name}:${value}`,
        apiType,
    };
};

const getSuggestions = (
    data: any,
    selectedTypes: string[],
    limitResultsCount?: number
) => {
    const suggestions = [];

    if (selectedTypes.includes('Track Properties')) {
        suggestions.push({
            label: 'Track Properties',
            options: data
                ?.trackProperties!.map((suggestion: Suggestion) =>
                    transformToOption(suggestion, 'trackProperties')
                )
                .slice(0, limitResultsCount),
        });
    }
    if (selectedTypes.includes('User Properties')) {
        suggestions.push({
            label: 'User Properties',
            options: data
                ?.userProperties!.map((suggestion: Suggestion) =>
                    transformToOption(suggestion, 'userProperties')
                )
                .slice(0, limitResultsCount),
        });
    }
    if (selectedTypes.includes('Visited URLs')) {
        suggestions.push({
            label: 'Visited URLs',
            options: data
                ?.visitedUrls!.map((suggestion: Suggestion) =>
                    transformToOption(suggestion, 'visitedUrls')
                )
                .slice(0, limitResultsCount),
        });
    }
    if (selectedTypes.includes('Referrers')) {
        suggestions.push({
            label: 'Referrers',
            options: data
                ?.referrers!.map((suggestion: Suggestion) =>
                    transformToOption(suggestion, 'referrers')
                )
                .slice(0, limitResultsCount),
        });
    }

    return suggestions;
};

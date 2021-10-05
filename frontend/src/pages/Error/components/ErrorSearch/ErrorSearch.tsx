import { useParams } from '@util/react-router/useParams';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
import { components } from 'react-select';
import AsyncSelect from 'react-select/async';

import InfoTooltip from '../../../../components/InfoTooltip/InfoTooltip';
import TextHighlighter from '../../../../components/TextHighlighter/TextHighlighter';
import { useGetErrorSearchSuggestionsQuery } from '../../../../graph/generated/hooks';
import SvgSearchIcon from '../../../../static/SearchIcon';
import { useErrorSearchContext } from '../../../Errors/ErrorSearchContext/ErrorSearchContext';
import { useErrorPageUIContext } from '../../context/ErrorPageUIContext';
import styles from './ErrorSearch.module.scss';

const ErrorSearch = () => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const [query, setQuery] = useState('');
    const [selectedProperties, setSelectedProperties] = useState<
        ErrorSearchOption[]
    >([]);
    const { setSearchParams } = useErrorSearchContext();
    const { setSearchBarRef } = useErrorPageUIContext();

    const handleChange = (_selectedProperties: any) => {
        const selectedProperties = transformSelectedProperties(
            _selectedProperties
        ) as ErrorSearchOption[];
        setSelectedProperties(selectedProperties);

        const newSearchParams: {
            visited_url: string[];
            event: string[];
        } = {
            event: [],
            visited_url: [],
        };
        selectedProperties?.forEach(({ apiType, name }) => {
            switch (apiType) {
                case 'event':
                    newSearchParams.event.push(name);
                    break;
                case 'visitedUrls':
                    newSearchParams.visited_url.push(name);
                    break;
            }
        });

        setSearchParams((params) => ({
            ...params,
            event:
                newSearchParams.event.length > 0
                    ? newSearchParams.event[0]
                    : undefined,
            visited_url:
                newSearchParams.visited_url.length > 0
                    ? newSearchParams.visited_url[0]
                    : undefined,
        }));
    };

    const { loading, data, refetch } = useGetErrorSearchSuggestionsQuery({
        variables: {
            project_id,
            query: '',
        },
    });

    const generateOptions = async (input: string, callback: any) => {
        refetch({
            project_id,
            query: input,
        }).then((fetched) => {
            callback(getSuggestions(fetched.data, query, 10));
        });
    };

    const debouncedGenerateOptions = useMemo(
        () => _.debounce(generateOptions, 200),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <AsyncSelect
            ref={(ref) => {
                if (ref) {
                    setSearchBarRef(ref);
                } else {
                    setSearchBarRef(undefined);
                }
            }}
            isMulti
            loadOptions={debouncedGenerateOptions}
            isLoading={loading}
            isClearable={false}
            onChange={handleChange}
            className={styles.select}
            openMenuOnFocus
            value={selectedProperties}
            placeholder="Search for an error message..."
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
                                            <TextHighlighter
                                                className={styles.nameLabel}
                                                searchWords={query.split(' ')}
                                                autoEscape={true}
                                                textToHighlight={name}
                                                sanitize={(text) => {
                                                    // Don't bold the contains options
                                                    if (
                                                        text.includes(
                                                            'Contains: '
                                                        )
                                                    ) {
                                                        return '';
                                                    }
                                                    return text;
                                                }}
                                            />
                                            <TextHighlighter
                                                className={styles.keyLabel}
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
                GroupHeading: (props) => {
                    return (
                        <components.GroupHeading {...props}>
                            <span className={styles.groupHeading}>
                                {props.children}{' '}
                                <InfoTooltip title={props?.data?.tooltip} />
                            </span>
                        </components.GroupHeading>
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
                option: (provided, state) => ({
                    ...provided,
                    paddingTop: 'var(--size-small)',
                    paddingBottom: 'var(--size-small)',
                    backgroundColor: state.isFocused
                        ? 'var(--color-gray-200)'
                        : state.isSelected
                        ? 'var(--color-gray-300)'
                        : 'var(--background-color-primary)',
                    ':active': {
                        backgroundColor: 'var(--color-gray-300)',
                    },
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
                placeholder: (provided) => ({
                    ...provided,
                    color: `var(--color-gray-400)`,
                }),
            }}
            isSearchable
            defaultOptions={getSuggestions(data, query, 3)}
            maxMenuHeight={400}
        />
    );
};

export default ErrorSearch;

/**
 * The session properties that support search.
 */
type API_TYPES = 'visitedUrls' | 'event';

export interface ErrorSearchOption {
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
): ErrorSearchOption => {
    const valueToUse = value;

    if (
        valueToUse.split(':').length === 2 &&
        !valueToUse.includes('https://')
    ) {
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
    query: string,
    limitResultsCount?: number
) => {
    const suggestions: {
        label: string;
        tooltip: string | React.ReactNode;
        options: ErrorSearchOption[];
    }[] = [];

    suggestions.push({
        label: 'Error Message',
        tooltip: 'The body of the error message.',
        options: [
            //     ...getIncludesOption(query, 'trackProperties', 'track'),
            ...(data?.fields
                ?.map((suggestion: Suggestion) =>
                    transformToOption(suggestion, 'event')
                )
                .slice(0, limitResultsCount) || []),
        ],
    });
    suggestions.push({
        label: 'Visited URLs',
        tooltip:
            'Visited URLs are the URLs that the error was thrown on. Filtering with a Visited URL will show you all errors thrown on that URL.',
        options: [
            //     ...getIncludesOption(query, 'visitedUrls', 'visitedUrl'),
            ...(data?.visitedUrls
                ?.map((suggestion: Suggestion) =>
                    transformToOption(suggestion, 'visitedUrls')
                )
                .slice(0, limitResultsCount) || []),
        ],
    });

    return suggestions;
};

// Our API doesn't support includes yet.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getIncludesOption = (
    query: string,
    apiType: string,
    valueType: string
) => {
    return query.length === 0
        ? []
        : [
              {
                  apiType,
                  id: '-1',
                  name: `Contains: ${query}`,
                  value: `${query}`,
                  valueType,
              },
          ];
};

const transformSelectedProperties = (selectedProperties: any[]) => {
    return selectedProperties?.map((property) => {
        if (property.name.includes('Contains:')) {
            if (
                property.apiType === 'visitedUrls' ||
                property.apiType === 'referrers'
            ) {
                return {
                    ...property,
                    name: property.value,
                };
            }
            return {
                ...property,
                name: 'contains',
            };
        }
        return property;
    });
};

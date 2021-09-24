import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { components } from 'react-select';
import AsyncSelect from 'react-select/async';

import InfoTooltip from '../../../../../components/InfoTooltip/InfoTooltip';
import TextHighlighter from '../../../../../components/TextHighlighter/TextHighlighter';
import { useGetSessionSearchResultsQuery } from '../../../../../graph/generated/hooks';
import useSelectedSessionSearchFilters from '../../../../../persistedStorage/useSelectedSessionSearchFilters';
import SvgSearchIcon from '../../../../../static/SearchIcon';
import { usePlayerUIContext } from '../../../../Player/context/PlayerUIContext';
import {
    UserProperty,
    useSearchContext,
} from '../../../SearchContext/SearchContext';
import SessionSearchFilters from '../../../SessionsFeed/components/SessionSearch/components/SessionSearchFilters/SessionSearchFilters';
import styles from './SessionSearch.module.scss';

const SessionSearch = () => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const [query, setQuery] = useState('');
    const [selectedProperties, setSelectedProperties] = useState<
        SessionSearchOption[]
    >([]);
    const { searchParams, setSearchParams } = useSearchContext();
    const { setSearchBarRef } = usePlayerUIContext();
    const { selectedSearchFilters } = useSelectedSessionSearchFilters();

    const handleChange = (_selectedProperties: any) => {
        const selectedProperties = transformSelectedProperties(
            _selectedProperties
        ) as SessionSearchOption[];
        setSelectedProperties(selectedProperties);

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
            project_id,
            query: '',
        },
    });

    const generateOptions = (input: string, callback: any) => {
        refetch({
            project_id,
            query: input,
        }).then((fetched) => {
            callback(
                getSuggestions(fetched.data, selectedSearchFilters, input, 3)
            );
        });
    };

    const debouncedGenerateOptions = useMemo(
        () => _.debounce(generateOptions, 200),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

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
            placeholder="Enter a property, URL, user, etc..."
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
            menuIsOpen
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
                Menu: (props) => {
                    return (
                        <components.Menu
                            {...props}
                            className={classNames(props.className, styles.menu)}
                        >
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
                group: (provided) => ({
                    ...provided,
                    paddingTop: 0,
                    paddingBottom: 0,
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
            defaultOptions={getSuggestions(
                data,
                selectedSearchFilters,
                query,
                3
            )}
            maxMenuHeight={400}
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

export interface SessionSearchOption {
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
    selectedTypes: string[],
    query: string,
    limitResultsCount?: number
) => {
    const suggestions: {
        label: string;
        tooltip: string | React.ReactNode;
        options: SessionSearchOption[];
    }[] = [];

    if (selectedTypes.includes('Track Properties')) {
        suggestions.push({
            label: 'Track Properties',
            tooltip: (
                <>
                    Track Properties are properties related to events that have
                    happened in your application. These are set by you in your
                    application. You can{' '}
                    <a
                        href="https://docs.highlight.run/docs/tracking-events"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        learn more here
                    </a>
                    .
                </>
            ),
            options: [
                ...getIncludesOption(query, 'trackProperties', 'track'),
                ...(data?.trackProperties
                    ?.map((suggestion: Suggestion) =>
                        transformToOption(suggestion, 'trackProperties')
                    )
                    .slice(0, limitResultsCount) || []),
            ],
        });
    }
    if (selectedTypes.includes('User Properties')) {
        suggestions.push({
            label: 'User Properties',
            tooltip: (
                <>
                    User Properties are properties related to the user. These
                    are set by you in your application. You can{' '}
                    <a
                        href="https://docs.highlight.run/docs/identifying-users"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        learn more here
                    </a>
                    .
                </>
            ),
            options: [
                ...getIncludesOption(query, 'userProperties', 'user'),
                ...(data?.userProperties
                    ?.map((suggestion: Suggestion) =>
                        transformToOption(suggestion, 'userProperties')
                    )
                    .slice(0, limitResultsCount) || []),
            ],
        });
    }
    if (selectedTypes.includes('Visited URLs')) {
        suggestions.push({
            label: 'Visited URLs',
            tooltip:
                'Visited URLs are the URLs a user has visited. Filtering with a Visited URL will show you all sessions where a user visited that URL.',
            options: [
                ...getIncludesOption(query, 'visitedUrls', 'visitedUrl'),
                ...(data?.visitedUrls
                    ?.map((suggestion: Suggestion) =>
                        transformToOption(suggestion, 'visitedUrls')
                    )
                    .slice(0, limitResultsCount) || []),
            ],
        });
    }
    if (selectedTypes.includes('Referrers')) {
        suggestions.push({
            label: 'Referrers',
            tooltip:
                'Referrers are the websites your users came from. For example, if a user on Twitter clicked a link to your application, the referrer would be Twitter.',
            options: [
                ...getIncludesOption(query, 'referrers', 'referrers'),
                ...(data?.referrers
                    ?.map((suggestion: Suggestion) =>
                        transformToOption(suggestion, 'referrers')
                    )
                    .slice(0, limitResultsCount) || []),
            ],
        });
    }

    return suggestions;
};

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

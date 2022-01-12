import TextHighlighter from '@components/TextHighlighter/TextHighlighter';
import SvgBugIcon from '@icons/BugIcon';
import SvgSearchIcon from '@icons/SearchIcon';
import SvgSessionsIcon from '@icons/SessionsIcon';
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams';
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext';
import { SharedSelectStyleProps } from '@pages/Sessions/SearchInputs/SearchInputUtil';
import { useParams } from '@util/react-router/useParams';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { components, Styles } from 'react-select';
import AsyncSelect from 'react-select/async';

import { useGetQuickFieldsOpensearchQuery } from '../../../../../graph/generated/hooks';
import styles from './QuickSearch.module.scss';

interface QuickSearchOption {
    type: string;
    name: string;
    value: string;
    __typename: string;
}

const getQueryFieldKey = (input: QuickSearchOption) =>
    input.type.toLowerCase() + '_' + input.name.toLowerCase();

const getErrorFieldKey = (input: QuickSearchOption) =>
    'error-field_' + input.name.toLowerCase();

const styleProps: Styles<any, false> = {
    ...SharedSelectStyleProps,
    option: (provided, { isFocused }) => ({
        ...provided,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        direction: 'ltr',
        textAlign: 'left',
        padding: '8px 12px',
        fontSize: '12px',
        color: 'var(--color-text-primary)',
        backgroundColor: isFocused ? 'var(--color-gray-200)' : 'none',
        '&:active': {
            backgroundColor: 'var(--color-gray-200)',
        },
        transition: 'all 0.2s ease-in-out',
    }),
    menuList: (provided) => ({
        ...provided,
        scrollbarWidth: 'none',
        padding: '0',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    }),
    control: (provided) => ({
        ...provided,
        border: '1px solid var(--color-gray-300)',
        borderRadius: 'var(--border-radius)',
        boxShadow: '0',
        fontSize: '12px',
        background: 'none',
        flexDirection: 'row-reverse',
        minHeight: '32px',
        '&:hover': {
            'border-color': 'var(--color-purple) !important',
        },
        transition: 'all 0.2s ease-in-out',
        '&:focus-within': {
            'box-shadow':
                '0 0 0 4px rgba(var(--color-purple-rgb), 0.2) !important',
            'border-color': 'var(--color-purple) !important',
        },
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '0 12px',
        height: '32px',
    }),
    noOptionsMessage: (provided) => ({
        ...provided,
        fontSize: '12px',
    }),
    loadingMessage: (provided) => ({
        ...provided,
        fontSize: '12px',
    }),
    loadingIndicator: (provided) => ({
        ...provided,
        padding: '0',
        margin: '0 -2px 0 10px',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: 'var(--color-gray-500) !important',
    }),
};

const QuickSearch = () => {
    const history = useHistory();
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const [query, setQuery] = useState('');
    const {
        setSearchParams,
        setExistingParams,
        setQueryBuilderInput,
    } = useSearchContext();

    const { loading, refetch } = useGetQuickFieldsOpensearchQuery({
        variables: {
            project_id,
            count: 10,
            query: '',
        },
        notifyOnNetworkStatusChange: true,
    });

    const getOption = (props: any) => {
        const {
            data: { name, value, type },
        } = props;

        return (
            <div>
                <components.Option {...props}>
                    <div className={styles.optionLabelContainer}>
                        {type ? (
                            <SvgSessionsIcon className={styles.typeIcon} />
                        ) : (
                            <SvgBugIcon className={styles.typeIcon} />
                        )}
                        {!!name && (
                            <div>
                                <div className={styles.optionLabelType}>
                                    {`${name}: `}
                                </div>
                            </div>
                        )}
                        <TextHighlighter
                            className={styles.optionLabelName}
                            searchWords={query.split(' ')}
                            autoEscape={true}
                            textToHighlight={value}
                        />
                    </div>
                </components.Option>
            </div>
        );
    };

    const getValueOptions = async (input: string) => {
        return await refetch({
            project_id,
            count: 10,
            query: input,
        }).then((fetched) => {
            return fetched.data.quickFields_opensearch;
        });
    };

    return (
        <AsyncSelect
            loadOptions={getValueOptions}
            styles={styleProps}
            isLoading={loading}
            isClearable={false}
            value={null}
            escapeClearsValue={true}
            onChange={(val) => {
                const field = val as QuickSearchOption;
                // Sessions results have a type defined, errors do not
                if (field.type !== '') {
                    const searchParams = {
                        ...EmptySessionsSearchParams,
                        query: JSON.stringify({
                            isAnd: true,
                            rules: [
                                [getQueryFieldKey(field), 'is', field.value],
                            ],
                        }),
                    };
                    history.push(`/${project_id}/sessions`);
                    setExistingParams(searchParams);
                    setSearchParams(searchParams);
                } else {
                    setQueryBuilderInput({
                        type: 'errors',
                        isAnd: true,
                        rules: [[getErrorFieldKey(field), 'is', field.value]],
                    });
                    history.push(`/${project_id}/errors`);
                }
            }}
            className={styles.select}
            noOptionsMessage={({ inputValue }) =>
                !inputValue ? null : `No results for "${inputValue}"`
            }
            placeholder="Search for a property..."
            onInputChange={(newValue, actionMeta) => {
                if (actionMeta?.action === 'input-change') {
                    setQuery(newValue);
                } else {
                    setQuery('');
                }
            }}
            components={{
                DropdownIndicator: () =>
                    loading ? (
                        <></>
                    ) : (
                        <SvgSearchIcon className={styles.searchIcon} />
                    ),
                IndicatorSeparator: () => null,
                Option: getOption,
            }}
            isSearchable
            defaultOptions
            maxMenuHeight={400}
        />
    );
};

export default QuickSearch;

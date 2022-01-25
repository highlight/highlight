import { LoadingOutlined } from '@ant-design/icons';
import TextHighlighter from '@components/TextHighlighter/TextHighlighter';
import SvgSearchIcon from '@icons/SearchIcon';
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams';
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext';
import { SharedSelectStyleProps } from '@pages/Sessions/SearchInputs/SearchInputUtil';
import { useParams } from '@util/react-router/useParams';
import { Spin } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
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

const ERROR_TYPE = 'error-field';
const RESULT_COUNT = 10;

const getQueryFieldKey = (input: QuickSearchOption) =>
    input.type.toLowerCase() + '_' + input.name.toLowerCase();

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
    menu: (provided) => ({
        ...provided,
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--box-shadow)',
        border: '1px solid var(--color-gray-300)',
    }),
    menuList: (provided) => ({
        ...provided,
        scrollbarWidth: 'none',
        padding: '0',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    }),
    input: (provided) => ({
        ...provided,
        lineHeight: 'normal',
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
        cursor: 'text',
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
        color: 'var(--color-gray-600) !important',
        top: '53%',
        cursor: 'text',
    }),
};

const QuickSearch = () => {
    const history = useHistory();
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const [query, setQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const {
        setSearchParams,
        setExistingParams,
        setQueryBuilderInput,
    } = useSearchContext();

    const { loading, refetch } = useGetQuickFieldsOpensearchQuery({
        variables: {
            project_id,
            count: RESULT_COUNT,
            query: '',
        },
        notifyOnNetworkStatusChange: true,
    });

    const getOption = (props: any) => {
        const {
            data: { name, value },
        } = props;

        return (
            <div>
                <components.Option {...props}>
                    <div className={styles.optionLabelContainer}>
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

    const getValueOptions = (input: string, callback: any) => {
        refetch({
            project_id,
            count: RESULT_COUNT,
            query: input,
        }).then((fetched) => {
            const suggestions: {
                label: string;
                tooltip: string | React.ReactNode;
                options: QuickSearchOption[];
            }[] = [];

            const sessionOptions: QuickSearchOption[] = [];
            const errorOptions: QuickSearchOption[] = [];
            fetched.data.quickFields_opensearch.forEach((item) => {
                const option = item as QuickSearchOption;
                if (option.type === ERROR_TYPE) {
                    errorOptions.push(option);
                } else {
                    sessionOptions.push(option);
                }
            });

            // Show {RESULT_COUNT} total sessions + errors,
            // in equal proportion to the number of each returned.
            const sessionsCount = sessionOptions.length;
            const errorsCount = errorOptions.length;
            const totalCount = sessionsCount + errorsCount;
            const shownSessions = Math.round(
                (sessionsCount / totalCount) * RESULT_COUNT
            );
            const shownErrors = RESULT_COUNT - shownSessions;

            suggestions.push({
                label: 'Sessions',
                tooltip: 'Fields recorded for sessions.',
                options: sessionOptions.slice(0, shownSessions),
            });

            suggestions.push({
                label: 'Errors',
                tooltip: 'Fields recorded for errors.',
                options: errorOptions.slice(0, shownErrors),
            });

            setIsTyping(false);
            callback(suggestions);
        });
    };

    const onChange = (val: any) => {
        const field = val as QuickSearchOption;
        if (field.type === ERROR_TYPE) {
            setQueryBuilderInput({
                type: 'errors',
                isAnd: true,
                rules: [[getQueryFieldKey(field), 'is', field.value]],
            });
            history.push(`/${project_id}/errors`);
        } else {
            const searchParams = {
                ...EmptySessionsSearchParams,
                query: JSON.stringify({
                    isAnd: true,
                    rules: [[getQueryFieldKey(field), 'is', field.value]],
                }),
            };
            history.push(`/${project_id}/sessions`);
            setExistingParams(searchParams);
            setSearchParams(searchParams);
        }
    };

    // Ignore this so we have a consistent reference so debounce works.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadOptions = useMemo(() => _.debounce(getValueOptions, 300), []);

    const isLoading = loading || isTyping;

    return (
        <div className={styles.container}>
            <DropdownIndicator isLoading={isLoading} />
            <AsyncSelect
                loadOptions={loadOptions}
                styles={styleProps}
                isLoading={isLoading}
                isClearable={false}
                value={null}
                escapeClearsValue={true}
                onChange={onChange}
                className={classNames(styles.select, {
                    [styles.menuIsOpen]: isMenuOpen,
                })}
                onMenuOpen={() => {
                    setIsMenuOpen(true);
                }}
                onMenuClose={() => {
                    setIsMenuOpen(false);
                }}
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
                    setIsTyping(newValue !== '');
                }}
                components={{
                    DropdownIndicator: () => (
                        <div className={styles.dropdownPlaceholder}></div>
                    ),
                    IndicatorSeparator: () => null,
                    Option: getOption,
                    GroupHeading: (props) => {
                        return (
                            <components.GroupHeading {...props}>
                                <span className={styles.groupHeading}>
                                    {props.children}
                                </span>
                            </components.GroupHeading>
                        );
                    },
                    LoadingIndicator: () => {
                        return <></>;
                    },
                }}
                isSearchable
                defaultOptions
                maxMenuHeight={500}
            />
            <div
                className={classNames(styles.backdrop, {
                    [styles.visible]: isMenuOpen,
                })}
            ></div>
        </div>
    );
};

export default QuickSearch;

const DropdownIndicator = React.memo(
    ({ isLoading }: { isLoading: boolean }) => {
        return isLoading ? (
            <div
                className={classNames(
                    styles.loadingIconContainer,
                    styles.dropdownIndicator,
                    styles.spinner
                )}
            >
                <Spin
                    indicator={
                        <LoadingOutlined className={styles.loadingIcon} />
                    }
                />
            </div>
        ) : (
            <SvgSearchIcon
                className={classNames(
                    styles.searchIcon,
                    styles.dropdownIndicator
                )}
            />
        );
    }
);

import React, { useEffect, useRef, useState } from 'react';
import parse from 'parse-duration';
import { useParams } from 'react-router-dom';
// @ts-ignore
import written from 'written-number';
import fuzzy from 'fuzzy';
import { useQuery, useLazyQuery, gql } from '@apollo/client';

import styles from './SessionsPage.module.scss';

export const FieldOptions = ({
    input,
    field,
    onSelect,
    defaultText,
}: {
    input: string;
    field: string;
    onSelect: (option: Value) => void;
    defaultText: string;
}) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [results, setResults] = useState<fuzzy.FilterResult<Value>[]>([]);
    const index = useKeySelector(results.length, (i: number) => {
        onSelect(results[i]?.original);
    });
    const [fieldSuggestion, { data }] = useLazyQuery<
        { field_suggestion: string[] },
        { organization_id: number; field: string; query: string }
    >(
        gql`
            query GetFieldSuggestion(
                $organization_id: ID!
                $field: String!
                $query: String!
            ) {
                field_suggestion(
                    organization_id: $organization_id
                    field: $field
                    query: $query
                )
            }
        `
    );

    useEffect(() => {
        fieldSuggestion({
            variables: { field, query: input, organization_id: parseInt(organization_id) },
        });
    }, [input, fieldSuggestion, organization_id, field]);

    useEffect(() => {
        if (data?.field_suggestion.length) {
            console.log('suggestions:', data.field_suggestion);
            var filterResults = fuzzy.filter<Value>(
                input,
                data?.field_suggestion.map((s) => {
                    return { text: s, value: s };
                }) ?? [],
                {
                    pre: `<strong style="color: #5629c6;">`,
                    post: '</strong>',
                    extract: (f) => f.text,
                }
            );
            setResults(filterResults);
        }
    }, [data, input]);

    return (
        <>
            {results
                .map((f, i) => {
                    return (
                        <div
                            onClick={() => {
                                onSelect(f?.original);
                            }}
                            className={styles.optionsRow}
                            key={i}
                            style={{
                                backgroundColor:
                                    i === index ? '#F2EEFB' : 'transparent',
                            }}
                            dangerouslySetInnerHTML={{ __html: f.string }}
                        />
                    );
                })
                .slice(0, 8)}
        </>
    );
};

export const DateOptions = ({
    input,
    onSelect,
    defaultText,
}: {
    input: string;
    onSelect: (option: Value) => void;
    defaultText: string;
}) => {
    const [results, setResults] = useState<fuzzy.FilterResult<Value>[]>([]);
    const index = useKeySelector(results.length, (i: number) => {
        onSelect(results[i]?.original);
    });

    useEffect(() => {
        setResults(
            fuzzy
                .filter<Value>(input, generateDurationObjects(), {
                    pre: `<strong style="color: #5629c6;">`,
                    post: '</strong>',
                    extract: (f) => f.text,
                })
                .slice(0, 5)
        );
    }, [input]);

    return (
        <>
            {results
                .map((f, i) => {
                    return (
                        <div
                            onClick={() => onSelect(f?.original)}
                            className={styles.optionsRow}
                            key={i}
                            style={{
                                backgroundColor:
                                    i === index ? '#F2EEFB' : 'transparent',
                            }}
                            dangerouslySetInnerHTML={{ __html: f.string }}
                        />
                    );
                })
                .slice(0, 5)}
        </>
    );
};

export const OptionsFilter = ({
    input,
    params,
    onSelect,
}: {
    input: string;
    params: SearchParam[];
    onSelect: (action: SearchParam) => void;
}) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const isUserProperty = (property: fuzzy.FilterResult<SearchParam>) =>
        !['referrer', 'segment-event', 'visited-url'].includes(
            property.original.action
        );
    const [results, setResults] = useState<fuzzy.FilterResult<SearchParam>[]>(
        []
    );
    const [customResults, setCustomResults] = useState<
        fuzzy.FilterResult<SearchParam>[]
    >([]);
    const allResults = [
        ...results,
        ...customResults.filter((e) => !isUserProperty(e)),
        ...customResults.filter(isUserProperty),
    ];
    const index = useKeySelector(
        results.length + customResults.length,
        (i: number) => {
            onSelect(allResults[i].original);
        }
    );
    const { data } = useQuery<{ fields: Array<string> }>(
        gql`
            query GetFields($organization_id: ID!) {
                fields(organization_id: $organization_id)
            }
        `,
        { variables: { organization_id: organization_id } }
    );

    const dataFields = data?.fields;

    useEffect(() => {
        const customParams = dataFields?.map(
            (f: string): SearchParam => {
                return {
                    action: f,
                    description: 'text (e.g. jay, monica, jay@jay.com)',
                    type: 'text',
                };
            }
        );
        if (customParams) {
            setCustomResults(
                fuzzy.filter(input, customParams, {
                    pre: `<strong style="color: #5629c6;">`,
                    post: '</strong>',
                    extract: (f) => f.action,
                })
            );
        }
    }, [input, dataFields, data]);

    useEffect(() => {
        setResults(
            fuzzy.filter(input, params, {
                pre: `<strong style="color: #5629c6;">`,
                post: '</strong>',
                extract: (f) => f.action,
            })
        );
    }, [input, params]);

    return (
        <div className={styles.optionsSection}>
            <div className={styles.dropdownSection}>
                {results.length > 0 && (
                    <>
                        <div className={styles.dropdownTitle}>DURATION</div>
                        {results.map((f, i) => (
                            <div
                                key={i}
                                className={styles.optionsRow}
                                onClick={() => {
                                    onSelect(f?.original);
                                }}
                                style={{
                                    backgroundColor:
                                        allResults[index].original ===
                                            f.original
                                            ? '#F2EEFB'
                                            : 'transparent',
                                }}
                            >
                                <span
                                    className={styles.optionsKey}
                                    dangerouslySetInnerHTML={{
                                        __html: f.string,
                                    }}
                                />
                                : &nbsp;
                                <span className={styles.optionsValue}>
                                    {f.original.description}
                                </span>
                            </div>
                        ))}
                    </>
                )}
            </div>
            {customResults.filter((e) => !isUserProperty(e)).length > 0 && (
                <div className={styles.dropdownSection}>
                    <div className={styles.dropdownDivider} />
                    <div className={styles.dropdownTitle}>APP PROPERTIES</div>
                    {customResults
                        .filter((e) => !isUserProperty(e))
                        .map((f, i) => (
                            <div
                                key={i}
                                className={styles.optionsRow}
                                onClick={() => {
                                    onSelect(f?.original);
                                }}
                                style={{
                                    backgroundColor:
                                        allResults[index].original ===
                                            f.original
                                            ? '#F2EEFB'
                                            : 'transparent',
                                }}
                            >
                                <span
                                    className={styles.optionsKey}
                                    dangerouslySetInnerHTML={{
                                        __html: f.string,
                                    }}
                                />
                                : &nbsp;
                                <span className={styles.optionsValue}>
                                    {f.original.description}
                                </span>
                            </div>
                        ))}
                </div>
            )}
            {customResults.filter(isUserProperty).length > 0 && (
                <div className={styles.dropdownSection}>
                    <div className={styles.dropdownDivider} />
                    <div className={styles.dropdownTitle}>USER PROPERTIES</div>
                    {customResults.filter(isUserProperty).map((f, i) => (
                        <div
                            key={i}
                            className={styles.optionsRow}
                            onClick={() => {
                                onSelect(f?.original);
                            }}
                            style={{
                                backgroundColor:
                                    allResults[index].original === f.original
                                        ? '#F2EEFB'
                                        : 'transparent',
                            }}
                        >
                            <span
                                className={styles.optionsKey}
                                dangerouslySetInnerHTML={{ __html: f.string }}
                            />
                            : &nbsp;
                            <span className={styles.optionsValue}>
                                {f.original.description}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const generateDurationObjects = (): Value[] => {
    const units = [
        { unit: 'day', count: 31 },
        { unit: 'minute', count: 60 },
        { unit: 'second', count: 60 },
        { unit: 'hour', count: 24 },
        { unit: 'month', count: 12 },
    ];
    return units.flatMap((u) => generateUnitOptions(u));
};

const generateUnitOptions = (obj: { unit: string; count: number }): Value[] => {
    var options: Value[] = [];
    for (var i = 1; i < obj.count + 1; i++) {
        var unitStr = i === 1 ? obj.unit : obj.unit + 's';
        const f = i.toString() + ' ' + unitStr;
        const d = parse(f);
        if (d) {
            options.push({ text: f, value: d.toString() });
            options.push({
                text: written(i) + ' ' + unitStr,
                value: d.toString(),
            });
        }
    }
    return options;
};

// accepts a limit and incremements/decrements a count accordingly.
// onClick(i) is called with the current count as input when enter is pressed.
const useKeySelector = (l: number, onClick: (arg: any) => void): number => {
    const [index, setIndex] = useState<number>(0);
    const [limit, setLimit] = useState<number>(l);
    const indexRef = useRef(index);
    const limitRef = useRef(limit);
    useEffect(() => {
        const onPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIndex((i) => {
                    const n = Math.max(i - 1, 0);
                    indexRef.current = n;
                    return n;
                });
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIndex((i) => {
                    const n = Math.min(i + 1, limitRef.current - 1);
                    indexRef.current = n;
                    return n;
                });
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                onClick(indexRef.current);
            }
        };
        document.addEventListener('keydown', onPress, false);
        return () => {
            document.removeEventListener('keydown', onPress, false);
        };
    }, [onClick]);
    useEffect(() => {
        limitRef.current = l;
        setLimit(l);
    }, [l]);
    return indexRef.current;
};

export type SearchParam = {
    // name of the action or key (e.g. "more-than", "less-than", "email")
    action: string;
    // example text for the UI.
    description: string;
    // type of data (time, text, etc.)
    type: string;
    // The current value that the user inputs for this option.
    current?: string;
    // The actual value to send over the wire.
    value?: Value;
};

export type Value = {
    // The text representation of a value.
    text: string;
    // The actual representation (for a date, its a unix seconds string).
    value: string;
};

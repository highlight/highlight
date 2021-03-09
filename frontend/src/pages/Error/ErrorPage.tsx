import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Field } from '../../components/Field/Field';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';
import { useGetErrorGroupQuery } from '../../graph/generated/hooks';
import { ReactComponent as DownIcon } from '../../static/chevron-down.svg';
import LinesEllipsis from 'react-lines-ellipsis';

import styles from './ErrorPage.module.scss';
import Skeleton from 'react-loading-skeleton';
import Collapsible from 'react-collapsible';

export const ErrorPage = () => {
    const { error_id } = useParams<{ error_id: string }>();
    const { setOpenSidebar } = useContext(SidebarContext);
    const { data, loading } = useGetErrorGroupQuery({
        variables: { id: error_id },
    });
    const [title, setTitle] = useState<string | undefined>(undefined);
    const [eventLineExpand, setEventLineExpand] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(true);

    useEffect(() => {
        const eventText = data?.error_group?.event[0];
        let title = '';
        // Try to get the text in the form Text: ....
        const splitOnColon = eventText?.split(':') ?? [];
        if (
            splitOnColon.length &&
            (!splitOnColon[0].includes(' ') ||
                splitOnColon[0].toLowerCase().includes('error'))
        ) {
            title = splitOnColon[0];
            setTitle(title);
            return;
        }
        // Try to get text in the form "'Something' Error" in the event.
        const split = eventText?.split(' ') ?? [];
        let prev = '';
        for (let i = 0; i < split?.length; i++) {
            const curr = split[i];
            if (curr.toLowerCase().includes('error')) {
                title = (prev ? prev + ' ' : '') + curr;
                setTitle(title);
                return;
            }
            prev = curr;
        }
        setTitle(data?.error_group?.event.join() ?? '');
    }, [data]);

    useEffect(() => {
        setOpenSidebar(true);
    }, [setOpenSidebar]);

    return (
        <div className={styles.errorPageWrapper}>
            hello
            <div className={styles.blankSidebar} />
            <div className={styles.errorPage}>
                <div className={styles.titleWrapper}>
                    {loading ? (
                        <Skeleton count={1} style={{ width: 300 }} />
                    ) : (
                        <>
                            <div className={styles.title}>{title}</div>
                            <Field
                                k={'mechanism'}
                                v={data?.error_group?.type || 'window.onerror'}
                                color={'#FFDDDD'}
                            />
                        </>
                    )}
                </div>
                <div className={styles.eventText}>
                    {loading ? (
                        <Skeleton
                            count={2}
                            style={{ height: 20, marginBottom: 10 }}
                        />
                    ) : (
                        <>
                            <LinesEllipsis
                                text={data?.error_group?.event.join() ?? ''}
                                maxLine={
                                    eventLineExpand
                                        ? Number.MAX_SAFE_INTEGER
                                        : 2
                                }
                                style={{ display: 'inline' }}
                                onReflow={(c) => {
                                    setShowExpandButton(
                                        !(
                                            c.text ===
                                            data?.error_group?.event.join()
                                        )
                                    );
                                }}
                            />
                            {showExpandButton && (
                                <span
                                    className={styles.expandButton}
                                    onClick={() => setEventLineExpand(true)}
                                >
                                    {' '}
                                    show more
                                </span>
                            )}
                        </>
                    )}
                </div>
                <div className={styles.subTitle}>
                    {loading ? (
                        <Skeleton count={1} style={{ width: 300 }} />
                    ) : (
                        'Context / Fields'
                    )}
                </div>
                <div className={styles.fieldWrapper}>
                    {loading ? (
                        <Skeleton
                            count={2}
                            style={{ height: 20, marginBottom: 10 }}
                        />
                    ) : (
                        <>
                            {data?.error_group?.field_group?.map((e, i) => (
                                <Field
                                    key={i}
                                    k={e?.name ?? ''}
                                    v={e?.value.toLowerCase() ?? ''}
                                />
                            ))}
                        </>
                    )}
                </div>
                <div className={styles.subTitle}>
                    {loading ? (
                        <Skeleton
                            duration={1}
                            count={1}
                            style={{ width: 300 }}
                        />
                    ) : (
                        'Stack Trace'
                    )}
                </div>
                {data?.error_group?.trace.map((e, i) => (
                    <StackSection
                        key={i}
                        fileName={e?.file_name ?? ''}
                        functionName={e?.function_name ?? ''}
                        lineNumber={e?.line_number ?? 0}
                        columnNumber={e?.column_number ?? 0}
                    />
                ))}
            </div>
        </div>
    );
};

type StackSectionProps = {
    fileName?: string;
    functionName?: string;
    lineNumber?: number;
    columnNumber?: number;
};

export const StackSection: React.FC<StackSectionProps> = ({
    fileName,
    functionName,
    lineNumber,
    columnNumber,
}) => {
    const [expanded, setExpanded] = useState(false);
    const trigger = (
        <div className={styles.triggerWrapper}>
            <div className={styles.snippetHeadingTwo}>
                <span
                    className={styles.stackTraceErrorTitle}
                    style={{ maxWidth: 300, fontWeight: 300 }}
                >
                    {fileName}
                </span>
                <span style={{ fontWeight: 300, color: '#808080' }}>
                    &nbsp;in&nbsp;
                </span>
                <span
                    className={styles.stackTraceErrorTitle}
                    style={{ maxWidth: 300, fontWeight: 400 }}
                >
                    {functionName}
                </span>
                <span style={{ fontWeight: 300, color: '#808080' }}>
                    &nbsp;at line&nbsp;
                </span>
                <span>
                    {lineNumber}:{columnNumber}
                </span>
            </div>
            <div className={styles.iconWrapper}>
                <DownIcon
                    className={styles.icon}
                    style={{
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                    onClick={() => setExpanded((e) => !e)}
                />
            </div>
        </div>
    );
    return (
        <div className={styles.section}>
            <Collapsible
                open={expanded}
                onOpening={() => setExpanded(true)}
                onClosing={() => setExpanded(false)}
                trigger={trigger}
                transitionTime={150}
                style={{ margin: 10, width: '100%' }}
                className={styles.collapsible}
            >
                {expanded ? (
                    <>
                        <div className={styles.subSection}>
                            There's nothing to see here right now.
                        </div>
                    </>
                ) : (
                    <></>
                )}
            </Collapsible>
        </div>
    );
};

import { Tag } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import ReactJson from 'react-json-view';
import { useParams } from 'react-router';
import { Field } from '../../components/Field/Field';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';
import { useGetErrorGroupQuery } from '../../graph/generated/hooks';
import LinesEllipsis from 'react-lines-ellipsis';

import styles from './ErrorPage.module.scss';

export const ErrorPage = () => {
    const { error_id } = useParams<{ error_id: string }>();
    const { setOpenSidebar } = useContext(SidebarContext);
    const { data } = useGetErrorGroupQuery({ variables: { id: error_id } });
    const [title, setTitle] = useState<string | undefined>(undefined);
    const [eventLineExpand, setEventLineExpand] = useState(false);

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
    }, [data]);

    useEffect(() => {
        setOpenSidebar(true);
    }, [setOpenSidebar]);

    return (
        <div className={styles.errorPageWrapper}>
            <div className={styles.blankSidebar} />
            <div className={styles.errorPage}>
                <div className={styles.title}>{title}</div>
                <div className={styles.eventText}>
                    <LinesEllipsis
                        text={data?.error_group?.event.join() ?? ''}
                        maxLine={eventLineExpand ? Number.MAX_SAFE_INTEGER : 2}
                        style={{ display: 'inline' }}
                    />
                    {!eventLineExpand && (
                        <span
                            className={styles.expandButton}
                            onClick={() => setEventLineExpand(true)}
                        >
                            expand
                        </span>
                    )}
                </div>
                <div className={styles.subTitle}>Context / Fields</div>
                <div className={styles.fieldWrapper}>
                    {data?.error_group?.field_group?.map((e, i) => (
                        <Field
                            key={i}
                            k={e?.name ?? ''}
                            v={e?.value.toLowerCase() ?? ''}
                        />
                    ))}
                </div>
                <div>
                    <ReactJson src={data ?? {}} />
                </div>
            </div>
        </div>
    );
};

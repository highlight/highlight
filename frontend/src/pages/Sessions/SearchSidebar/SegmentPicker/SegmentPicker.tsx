import { gql, useQuery } from '@apollo/client';
import React, { useContext, useEffect, useState } from 'react';
import { Link, Redirect, useParams } from 'react-router-dom';
import { SearchContext, SearchParams } from '../../SearchContext/SearchContext';
import { ReactComponent as CheckIcon } from '../../../../static/check.svg';
import { ReactComponent as PlusIcon } from '../../../../static/plus.svg';
import { ReactComponent as DownIcon } from '../../../../static/chevron-down.svg';
import { Dropdown, Tag } from 'antd';

import styles from './SegmentPicker.module.scss';
import { SearchSection } from '../SearchSection/SearchSection';

export const SegmentPicker = () => {
    const { setSearchParams, setIsSegment, isSegment } = useContext(SearchContext);
    const [visible, setVisible] = useState(false);
    const { segment_id, organization_id } = useParams<{ segment_id: string, organization_id: string }>();
    const { loading, error, data } = useQuery<
        { segments: Array<{ name: string; id: string; params: SearchParams; }> },
        { organization_id: number }
    >(
        gql`
            query GetSegments($organization_id: ID!) {
                segments(organization_id: $organization_id) {
                    id
                    name
                    params {
                        user_properties { name, value }
                        date_range { start_date, end_date }
                        os, browser, visited_url, referrer, identified
                    }
                }
            }
        `,
        { variables: { organization_id: parseInt(organization_id) } }
    );
    const currentSegment = data?.segments.find(s => s.id === segment_id);
    const menu = (
        <div className={styles.dropdownMenu}>
            <div className={styles.dropdownInner}>
                {data?.segments.map((s) => (
                    <Link
                        to={`/${organization_id}/sessions-beta/segment/${s.id}`}
                        key={s.id}
                    >
                        <div className={styles.segmentItem}>
                            <div className={styles.segmentText}>{s.name}</div>
                            {s.id === currentSegment?.id ? (
                                <CheckIcon className={styles.checkIcon} />
                            ) : (
                                    <></>
                                )}
                        </div>
                    </Link>
                ))}
                <Link className={styles.newSearchDiv} to={`/${organization_id}/sessions-beta/`}>
                    New Search
                    <PlusIcon className={styles.plusIcon} />
                </Link>
            </div>
        </div>
    );

    useEffect(() => {
        if (currentSegment) {
            var newParams: any = { ...currentSegment.params };
            var parsed: SearchParams = sanitize(newParams);
            setIsSegment(true);
            setSearchParams(parsed);
        } else {
            setIsSegment(false)
        }
    }, [currentSegment])

    return (
        <SearchSection title="Segment" open={false} titleSideComponent={
            <Tag color="#F2EEFB" style={{ marginLeft: 10, color: "black" }}>
                {currentSegment ? currentSegment?.name : "None"}
            </Tag>
        }>
            {!data?.segments.length ?
                <p>no segments, go create one!</p> :
                <Dropdown
                    placement={'bottomLeft'}
                    overlay={menu}
                    onVisibleChange={(v) => setVisible(v)}
                >
                    <div
                        className={styles.dropdownHandler}
                        onClick={(e) => e.preventDefault()}
                    >
                        <div className={styles.segmentNameText}>
                            {!isSegment ? <span style={{ color: "#808080" }}>None</span> : currentSegment?.name}
                        </div>
                        <DownIcon
                            className={styles.downIcon}
                            style={{
                                fill: !isSegment ? "#808080" : "black",
                                transform: visible ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                        />
                    </div>
                </Dropdown>
            }
        </SearchSection>
    );

}


const sanitize = (object: any): any => {
    const omitTypename = (key: any, value: any) => (key === '__typename' ? undefined : value)
    const newPayload = JSON.parse(JSON.stringify(object), omitTypename)
    return newPayload;
}
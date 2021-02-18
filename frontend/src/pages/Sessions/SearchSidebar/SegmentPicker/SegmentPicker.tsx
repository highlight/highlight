import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SearchContext, SearchParams } from '../../SearchContext/SearchContext';
import { ReactComponent as CheckIcon } from '../../../../static/check.svg';
import { ReactComponent as PlusIcon } from '../../../../static/plus.svg';
import { ReactComponent as DownIcon } from '../../../../static/chevron-down.svg';
import { Dropdown, Tag } from 'antd';
import Skeleton from 'react-loading-skeleton';

import styles from './SegmentPicker.module.scss';
import { SearchSection } from '../SearchSection/SearchSection';
import { useGetSegmentsQuery } from '../../../../graph/generated/hooks';

export const SegmentPicker = () => {
    const {
        setSearchParams,
        setSegmentName,
        setExistingParams,
        segmentName,
    } = useContext(SearchContext);
    const [visible, setVisible] = useState(false);
    const { segment_id, organization_id } = useParams<{
        segment_id: string;
        organization_id: string;
    }>();

    const { loading, data } = useGetSegmentsQuery({
        variables: { organization_id },
    });
    const currentSegment = data?.segments?.find((s) => s?.id === segment_id);
    const menu = (
        <div className={styles.dropdownMenu}>
            <div className={styles.dropdownInner}>
                {data?.segments?.map((s) => (
                    <Link
                        to={`/${organization_id}/sessions/segment/${s?.id}`}
                        key={s?.id}
                    >
                        <div className={styles.segmentItem}>
                            <div className={styles.segmentText}>{s?.name}</div>
                            {s?.id === currentSegment?.id ? (
                                <CheckIcon className={styles.checkIcon} />
                            ) : (
                                <></>
                            )}
                        </div>
                    </Link>
                ))}
                <Link
                    className={styles.newSearchDiv}
                    to={`/${organization_id}/sessions/`}
                >
                    New Search
                    <PlusIcon className={styles.plusIcon} />
                </Link>
            </div>
        </div>
    );

    useEffect(() => {
        if (currentSegment) {
            const newParams: any = { ...currentSegment.params };
            const parsed: SearchParams = sanitize(newParams);
            setSegmentName(currentSegment.name);
            setSearchParams(parsed);
            setExistingParams(parsed);
        } else {
            setSegmentName(null);
            setExistingParams({
                user_properties: [],
                identified: false,
            });
        }
    }, [currentSegment, setSegmentName, setSearchParams, setExistingParams]);

    return (
        <SearchSection
            title="Segment"
            open={false}
            titleSideComponent={
                <Tag color="#F2EEFB" style={{ marginLeft: 10, color: 'black' }}>
                    {currentSegment ? currentSegment?.name : 'None'}
                </Tag>
            }
        >
            {!data?.segments?.length ? (
                <div className={styles.noSegmentsText}>
                    No segments here :(. Feel free to create one by clicking{' '}
                    <span style={{ color: '#5629c6' }}>Save as Segment</span>!
                </div>
            ) : loading ? (
                <Skeleton />
            ) : (
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
                            {!segmentName ? (
                                <span style={{ color: '#808080' }}>
                                    Select a Segment
                                </span>
                            ) : (
                                currentSegment?.name
                            )}
                        </div>
                        <DownIcon
                            className={styles.downIcon}
                            style={{
                                fill: !segmentName ? '#808080' : 'black',
                                transform: visible
                                    ? 'rotate(180deg)'
                                    : 'rotate(0deg)',
                            }}
                        />
                    </div>
                </Dropdown>
            )}
        </SearchSection>
    );
};

const sanitize = (object: any): any => {
    const omitTypename = (key: any, value: any) =>
        key === '__typename' ? undefined : value;
    const newPayload = JSON.parse(JSON.stringify(object), omitTypename);
    return newPayload;
};

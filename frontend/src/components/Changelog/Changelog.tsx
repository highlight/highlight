import { gql, useQuery } from '@apollo/client';
import useLocalStorage from '@rehooks/local-storage';
import classNames from 'classnames';
import { H } from 'highlight.run';
import moment from 'moment';
import React, { HTMLProps, useState } from 'react';

import { useIntegrated } from '../../util/integrated';
import Popover from '../Popover/Popover';
import PopoverListContent from '../Popover/PopoverListContent';
import styles from './Changelog.module.scss';

const Announcements_Query = gql`
    {
        viewer {
            project(id: "pro_eTOZitaohMUZN") {
                announcements(first: 10) {
                    edges {
                        node {
                            id
                            headline
                            publishedAt
                            publicPermalink
                            excerpt
                        }
                    }
                }
            }
        }
    }
`;

interface AnnouncementNode {
    publishedAt: string;
    headline: string;
    id: string;
    publicPermalink: string;
    excerpt: string;
}

interface LaunchNotesResponse {
    viewer: {
        project: {
            announcements: {
                edges: {
                    node: AnnouncementNode;
                }[];
            };
        };
    };
}

const Changelog = (props: HTMLProps<HTMLDivElement>) => {
    const [data, setData] = useState<AnnouncementNode[] | null>(null);
    const [lastReadId, setLastReadId] = useLocalStorage(
        'highlightChangelogLastReadId',
        '0'
    );
    const [hasNewUpdates, setHasNewUpdates] = useState(false);
    const { integrated } = useIntegrated();

    const { loading } = useQuery<LaunchNotesResponse>(Announcements_Query, {
        context: {
            clientName: 'launchNotes',
        },
        onCompleted: (data) => {
            if (data) {
                const parsedData = data.viewer.project.announcements.edges
                    .map(({ node }) => {
                        return { ...node };
                    })
                    .sort(
                        (a, b) =>
                            new Date(b.publishedAt).getTime() -
                            new Date(a.publishedAt).getTime()
                    );

                setData(parsedData);
                const latestChangelogItem = parsedData[0];
                if (lastReadId !== latestChangelogItem.id) {
                    setHasNewUpdates(true);
                }
            }
        },
    });

    if (loading || !data || data.length === 0 || !integrated) {
        return null;
    }
    return (
        <div
            {...props}
            className={classNames(styles.container, props.className)}
        >
            <Popover
                align={{ offset: [18, -12] }}
                placement="rightBottom"
                hasBorder
                isList
                onVisibleChange={(visible) => {
                    if (visible) {
                        setHasNewUpdates(false);
                        setLastReadId(data[0].id);
                        H.track('Viewed changelog');
                    }
                }}
                content={
                    <div className={styles.changelogContainer}>
                        <PopoverListContent
                            listItems={data.map(
                                ({
                                    publishedAt,
                                    headline,
                                    id,
                                    publicPermalink,
                                    excerpt,
                                }) => (
                                    <a
                                        key={id}
                                        href={publicPermalink}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <p className={styles.date}>
                                            {moment(publishedAt).format(
                                                'YYYY-MM-DD'
                                            )}
                                        </p>
                                        <h3>{excerpt || headline}</h3>
                                    </a>
                                )
                            )}
                        />
                    </div>
                }
                title={
                    <div className={styles.popoverHeader}>
                        <h3>Changelog</h3>
                        <a
                            href="https://changes.highlight.run/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            View all updates
                        </a>
                    </div>
                }
            >
                <button className={classNames(styles.indicator)}>
                    <div
                        className={classNames(styles.indicatorIcon, {
                            [styles.active]: hasNewUpdates,
                        })}
                    />
                </button>
            </Popover>
        </div>
    );
};

export default Changelog;

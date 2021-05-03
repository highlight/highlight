import { gql, useQuery } from '@apollo/client';
import useLocalStorage from '@rehooks/local-storage';
import classNames from 'classnames';
import moment from 'moment';
import React, { useState } from 'react';
import Popover from '../Popover/Popover';
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

const Changelog = () => {
    const [data, setData] = useState<AnnouncementNode[] | null>(null);
    const [lastReadId, setLastReadId] = useLocalStorage(
        'highlightChangelogLastReadId',
        '0'
    );
    const [hasNewUpdates, setHasNewUpdates] = useState(false);

    const { loading } = useQuery<LaunchNotesResponse>(Announcements_Query, {
        context: {
            clientName: 'launchNotes',
        },
        onCompleted: (data) => {
            if (data) {
                const parsedData = data.viewer.project.announcements.edges.map(
                    ({ node }) => {
                        return { ...node };
                    }
                );

                setData(parsedData);
                const latestChangelogItem = parsedData[0];
                if (lastReadId !== latestChangelogItem.id) {
                    setHasNewUpdates(true);
                }
            }
        },
    });

    if (loading || !data || data.length === 0) {
        return null;
    }
    return (
        <div className={styles.container}>
            <Popover
                align={{ offset: [18, -12] }}
                placement="rightBottom"
                hasBorder
                onVisibleChange={() => {
                    setHasNewUpdates(false);
                    setLastReadId(data[0].id);
                }}
                content={
                    <div className={styles.changelogContainer}>
                        {data.map(
                            ({
                                publishedAt,
                                headline,
                                id,
                                publicPermalink,
                                excerpt,
                            }) => (
                                <a
                                    key={id}
                                    className={styles.changelogItem}
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
                    </div>
                }
                title={
                    <div className={styles.popoverHeader}>
                        <h3>Changelog</h3>
                        <a
                            href="https://highlight.launchnotes.io/"
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

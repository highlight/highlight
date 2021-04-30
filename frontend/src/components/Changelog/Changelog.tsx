import { gql, useQuery } from '@apollo/client';
import moment from 'moment';
import React, { useState } from 'react';
import Popover from '../Popover/Popover';
import styles from './Changelog.module.scss';

const Announcements_Query = gql`
    {
        viewer {
            project(id: "pro_eTOZitaohMUZN") {
                announcements {
                    edges {
                        node {
                            id
                            headline
                            createdAt
                        }
                    }
                }
            }
        }
    }
`;

interface AnnouncementNode {
    createdAt: string;
    headline: string;
    id: string;
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
            }
        },
    });

    if (loading || !data) {
        return null;
    }
    return (
        <div className={styles.container}>
            <Popover
                align={{ offset: [18, -12] }}
                placement="rightBottom"
                defaultVisible={true}
                hasBorder
                content={
                    <div className={styles.changelogContainer}>
                        {data.map(({ createdAt, headline, id }) => (
                            <div key={id} className={styles.changelogItem}>
                                <p className={styles.date}>
                                    {moment(createdAt).format('YYYY-MM-DD')}
                                </p>
                                <h3>{headline}</h3>
                            </div>
                        ))}
                    </div>
                }
            >
                <button className={styles.indicator}>
                    <div className={styles.indicatorIcon} />
                </button>
            </Popover>
        </div>
    );
};

export default Changelog;

import { gql, useQuery } from '@apollo/client';
import React, { useState } from 'react';
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
                            content
                            heroImage {
                                url
                            }
                        }
                    }
                }
            }
        }
    }
`;

interface AnnouncementNode {
    content: string;
    createdAt: string;
    headline: string;
    heroImage: {
        url?: string;
    };
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

interface Content {
    blocks: {
        key: string;
        text: string;
        type: string;
        depth: number;
    }[];
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
                        const blocks = JSON.parse(node.content) as Content;
                        const parsedContent = `<p>${blocks.blocks
                            .map((block) => block.text)
                            .join('</p><p>')}`;

                        return { ...node, content: parsedContent };
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
        <div className={styles.changelogContainer}>
            {data.map(
                ({ content, createdAt, headline, heroImage: { url }, id }) => (
                    <div key={id}>
                        <h2>{headline}</h2>
                        <p>{createdAt}</p>
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                        <img src={url} alt="" />
                    </div>
                )
            )}
        </div>
    );
};

export default Changelog;

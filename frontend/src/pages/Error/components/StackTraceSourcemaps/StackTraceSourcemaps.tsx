import { useGetSourcemapFilesQuery } from '@graph/hooks';
import { Maybe } from '@graph/schemas';
import { useParams } from '@util/react-router/useParams';
import React from 'react';

import styles from './StackTraceSourcemaps.module.scss';

interface Props {
    filePath?: Maybe<string>;
}

const StackTraceSourcemaps = ({ filePath }: Props) => {
    const { project_id } = useParams<{ project_id: string }>();
    const { data, loading } = useGetSourcemapFilesQuery({
        variables: {
            project_id,
        },
    });

    if (loading || !filePath || !data?.sourcemap_files.length) {
        return null;
    }

    const fileUrl = new URL(filePath);
    const filePathname = fileUrl.pathname;

    return (
        <div className={styles.container}>
            <h3>Your sourcemap info</h3>

            <p>
                We looked for a sourcemap file associated with{' '}
                <b>{filePathname}</b> but couldn't find anything. We searched
                for a <code>sourceMappingURL</code> comment inside the file and
                looked for an uploaded{' '}
                <b>{filePathname.replace('.js', '.map.js')}</b> file but
                couldn't find anything.
            </p>

            <p>
                Here are the files uploaded via
                <a
                    href="https://www.npmjs.com/package/@highlight-run/sourcemap-uploader"
                    target="_blank"
                    rel="noreferrer"
                >
                    @highlight-run/sourcemap-uploader
                </a>
                for your project.
            </p>

            <div className={styles.list}>
                <ul>
                    {data?.sourcemap_files.map((file) => (
                        <li key={file.key}>{file.key}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StackTraceSourcemaps;

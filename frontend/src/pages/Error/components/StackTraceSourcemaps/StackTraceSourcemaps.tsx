import { useGetSourcemapFilesQuery } from '@graph/hooks';
import React from 'react';

import styles from './StackTraceSourcemaps.module.scss';

interface Props {
    errorGroup: any;
}

const StackTraceSourcemaps = ({ errorGroup }: Props) => {
    const { data, loading } = useGetSourcemapFilesQuery({
        variables: {
            // TODO(ccshmitz): Is there anything else we can do to avoid this type mismatch?
            project_id: errorGroup.project_id.toString(),
        },
    });

    if (loading || !data?.sourcemap_files.length) {
        return null;
    }

    const filePath = errorGroup.structured_stack_trace[0]?.fileName;
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

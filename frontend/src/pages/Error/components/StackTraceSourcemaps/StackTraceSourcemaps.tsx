import { useGetSourcemapFilesQuery } from '@graph/hooks';
import { Maybe } from '@graph/schemas';
import React from 'react';

import styles from './StackTraceSourcemaps.module.scss';

interface Props {
    filePath?: Maybe<string>;
}

const StackTraceSourcemaps = ({ filePath }: Props) => {
    // const { project_id } = useParams<{ project_id: string }>();
    const [versions, setVersions] = React.useState<string[]>([]);
    const [selectedVersion, setSelectedVersion] = React.useState<string>('');
    const { data, loading } = useGetSourcemapFilesQuery({
        variables: {
            project_id: '726',
        },
        onCompleted: (data) => {
            if (!data?.sourcemap_files.length) {
                return;
            }

            data.sourcemap_files.forEach((file) => {
                const version = file.key?.split('/')[1];

                if (version && versions.indexOf(version) === -1) {
                    return setVersions([...versions, version]);
                }
            });

            setVersions(versions);
            setSelectedVersion(versions[0]);
        },
    });

    if (loading || !filePath || !data?.sourcemap_files.length) {
        return null;
    }

    const fileUrl = new URL(filePath);
    const filePathname = fileUrl.pathname;
    const visibleFiles = data.sourcemap_files.filter(
        (file) => !selectedVersion || file.key?.startsWith(selectedVersion)
    );

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

            {versions.length > 1 && (
                <div>
                    <p>Filter to a specific version</p>

                    <select
                        onChange={(e) => setSelectedVersion(e.target.value)}
                    >
                        {versions.map((version) => (
                            <option key={version} value={version}>
                                {version}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className={styles.list}>
                <ul>
                    {visibleFiles.map((file) => (
                        <li key={file.key}>{file.key}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StackTraceSourcemaps;

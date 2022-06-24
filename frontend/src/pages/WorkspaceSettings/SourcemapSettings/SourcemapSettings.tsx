import Select from '@components/Select/Select';
import { useGetSourcemapFilesQuery } from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import React from 'react';

import styles from './SourcemapSettings.module.scss';

const SourcemapSettings = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const [versions, setVersions] = React.useState<string[]>([]);
    const [selectedVersion, setSelectedVersion] = React.useState<string>('');
    const { data, loading } = useGetSourcemapFilesQuery({
        variables: {
            project_id,
        },
        // TODO: Consider refactoring so we make a separate request to get the
        // available versions from S3 rather than relying on string parsing.
        onCompleted: (data) => {
            if (!data?.sourcemap_files.length) {
                return;
            }

            const appVersions: string[] = [];
            data.sourcemap_files.forEach((file) => {
                const version = file.key?.split('/')[1];

                if (version && appVersions.indexOf(version) === -1) {
                    appVersions.push(version);
                }
            });

            setVersions(appVersions);
        },
    });

    if (loading) {
        return <p>Loading sourcemaps...</p>;
    }

    if (!data?.sourcemap_files.length) {
        return (
            <p>
                We don't have any sourcemap files for your project. Check{' '}
                <a
                    href="https://docs.highlight.run/sourcemaps"
                    target="_blank"
                    rel="noreferrer"
                >
                    the docs on uploading sourcemaps
                </a>{' '}
                for information on how to set this up. Once you have sourcemaps
                uploaded you will be able to view them here.
            </p>
        );
    }

    const prefix = `${project_id}/${selectedVersion}`;
    const visibleFiles = data?.sourcemap_files.filter(
        (file) => !selectedVersion || file.key?.startsWith(prefix)
    );

    const versionSelectOptions = versions.map((version) => ({
        value: version,
        id: version,
        displayValue: version,
    }));

    versionSelectOptions.unshift({
        id: '',
        displayValue: 'All versions',
        value: '',
    });

    return (
        <div>
            <p>Here are the sourcemap files we have for your project.</p>

            {versions.length > 1 && (
                <div>
                    <p>
                        We have sourcemaps for more than one version of your
                        app. Select an app version to filter the sourcemaps.
                    </p>

                    <Select
                        aria-label="App Version"
                        className={styles.select}
                        options={versionSelectOptions}
                        onChange={setSelectedVersion}
                        value={selectedVersion}
                    />
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

export default SourcemapSettings;

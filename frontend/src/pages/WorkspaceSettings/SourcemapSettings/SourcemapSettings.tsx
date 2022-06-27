import Card from '@components/Card/Card';
import Input from '@components/Input/Input';
import { ProgressBarTableRowGroup } from '@components/ProgressBarTable/components/ProgressBarTableColumns';
import ProgressBarTable from '@components/ProgressBarTable/ProgressBarTable';
import { useGetSourcemapFilesQuery } from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import React from 'react';

import styles from './SourcemapSettings.module.scss';

const SourcemapSettings = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const [query, setQuery] = React.useState<string>('');
    const { data, loading } = useGetSourcemapFilesQuery({
        variables: {
            project_id,
        },
    });

    const fileRegExp = new RegExp(`^(${project_id}/)`);
    const fileKeys =
        data?.sourcemap_files?.map((file) =>
            file.key?.replace(fileRegExp, '/')
        ) || [];

    const visibleFileKeys = query.length
        ? fileKeys.filter((key) => key && key.indexOf(query) > -1) || []
        : fileKeys || [];

    return (
        <div>
            <p>Here are the sourcemap files we have for your project.</p>

            <Card
                className={styles.list}
                title={
                    <div className={styles.listHeader}>
                        <Input
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="Search for a file"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                            }}
                            size="small"
                            disabled={loading}
                        />
                    </div>
                }
            >
                <ProgressBarTable
                    loading={loading}
                    columns={[
                        {
                            title: 'Sourcemap',
                            dataIndex: 'key',
                            key: 'key',
                            width: '100%',
                            render: (key) => {
                                return (
                                    <ProgressBarTableRowGroup>
                                        <span>{key}</span>
                                    </ProgressBarTableRowGroup>
                                );
                            },
                        },
                    ]}
                    data={visibleFileKeys?.map((file) => ({
                        key: file,
                        file: file,
                    }))}
                    onClickHandler={() => {}}
                    noDataMessage={
                        !visibleFileKeys?.length && (
                            <p>
                                We don't have any sourcemap files for your
                                project. Check{' '}
                                <a
                                    href="https://docs.highlight.run/sourcemaps"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    the docs on uploading sourcemaps
                                </a>{' '}
                                for information on how to set this up. Once you
                                have sourcemaps uploaded you will be able to
                                view them here.
                            </p>
                        )
                    }
                    noDataTitle={'No sourcemap data yet 😔'}
                />
            </Card>
        </div>
    );
};

export default SourcemapSettings;

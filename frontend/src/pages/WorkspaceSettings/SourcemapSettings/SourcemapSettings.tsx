import Card from '@components/Card/Card';
import { FieldsBox } from '@components/FieldsBox/FieldsBox';
import Input from '@components/Input/Input';
import ProgressBarTable from '@components/ProgressBarTable/ProgressBarTable';
import { useGetSourcemapFilesQuery } from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import { debounce } from 'lodash';
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

    const fileKeys = data?.sourcemap_files?.map((file) => file.key) || [];

    const visibleFileKeys = query.length
        ? fileKeys.filter((key) => key && key.indexOf(query) > -1)
        : fileKeys;

    const filterResults = debounce((query: string) => {
        setQuery(query);
    }, 300);

    return (
        <FieldsBox>
            <p>
                Below is a list of sourcemap files we have for your project.
                Check out{' '}
                <a
                    href="https://docs.highlight.run/sourcemaps"
                    target="_blank"
                    rel="noreferrer"
                >
                    the sourcemap docs
                </a>{' '}
                to learn more about sending sourcemaps to Highlight.
            </p>

            <Card
                className={styles.list}
                title={
                    <div className={styles.listHeader}>
                        <Input
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="Search for a file"
                            onChange={(e) => filterResults(e.target.value)}
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
                            render: (key) => (
                                <div className={styles.listRow}>{key}</div>
                            ),
                        },
                    ]}
                    data={visibleFileKeys?.map((file) => ({
                        key: file,
                        file: file,
                    }))}
                    onClickHandler={() => {}}
                    noDataMessage={
                        query ? (
                            <p>No source maps files match your search.</p>
                        ) : (
                            <p>
                                We don't have any sourcemap files for your
                                project. Once you upload some you will be able
                                to view them here.
                            </p>
                        )
                    }
                    noDataTitle={
                        query.length
                            ? 'Nothing to see here'
                            : 'No sourcemap data yet 😔'
                    }
                />
            </Card>
        </FieldsBox>
    );
};

export default SourcemapSettings;

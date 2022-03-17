import { useEditProjectMutation, useGetProjectQuery } from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { useParams } from '@util/react-router/useParams';
import { Form, message, Select } from 'antd';
import classNames from 'classnames/bind';
import React, { useEffect, useState } from 'react';

import commonStyles from '../../../Common.module.scss';
import Button from '../../../components/Button/Button/Button';
import {
    CircularSpinner,
    LoadingBar,
} from '../../../components/Loading/Loading';
import styles from './ExcludedUsersForm.module.scss';

export const ExcludedUsersForm = () => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const [excludedUsers, setExcludedUsers] = useState<string[]>([]);
    const { data, loading } = useGetProjectQuery({
        variables: {
            id: project_id,
        },
    });

    const [
        editProject,
        { loading: editProjectLoading },
    ] = useEditProjectMutation({
        refetchQueries: [
            namedOperations.Query.GetProjects,
            namedOperations.Query.GetProject,
        ],
    });

    const onSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        console.log('Excluded users: ', excludedUsers);
        editProject({
            variables: {
                id: project_id,
                excluded_users: excludedUsers,
            },
        }).then(() => {
            message.success('Updated project fields!', 5);
        });
    };

    useEffect(() => {
        if (!loading) {
            setExcludedUsers(data?.project?.excluded_users || []);
        }
    }, [data?.project?.excluded_users, loading]);

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <form onSubmit={onSubmit} key={project_id}>
            <p>
                Pick user identifiers to exclude from Highlight (regular
                expressions are accepted). Sessions from these users will be
                discarded once recorded.
            </p>
            <Form.Item name={'excludedusers'}>
                <Select
                    // className={styles.channelSelect}
                    mode="tags"
                    placeholder={`User identifiers that .`}
                    defaultValue={data?.project?.excluded_users || undefined}
                    onChange={(excluded: string[]) =>
                        setExcludedUsers(excluded)
                    }
                />
            </Form.Item>
            <div className={styles.fieldRow}>
                <div className={styles.fieldKey} />
                <Button
                    trackingId={`ExcludedUsersUpdate`}
                    htmlType="submit"
                    type="primary"
                    className={classNames(
                        commonStyles.submitButton,
                        styles.saveButton
                    )}
                >
                    {editProjectLoading ? (
                        <CircularSpinner
                            style={{
                                fontSize: 18,
                                color: 'var(--text-primary-inverted)',
                            }}
                        />
                    ) : (
                        'Save'
                    )}
                </Button>
            </div>
        </form>
    );
};

import { useAuthContext } from '@authentication/AuthContext';
import Button from '@components/Button/Button/Button';
import Input from '@components/Input/Input';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import Select from '@components/Select/Select';
import {
    useCreateIssueForErrorCommentMutation,
    useCreateIssueForSessionCommentMutation,
} from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import { Form, message } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { H } from 'highlight.run';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './NewIssueModal.module.scss';

interface NewIssueModalProps {
    visible: boolean;
    changeVisible: (newVal: boolean) => void;
    commentId: number;
    commentText: string;
    timestamp?: number;
    commentType: 'ErrorComment' | 'SessionComment';
}
const NewIssueModal: React.FC<NewIssueModalProps> = ({
    visible,
    changeVisible,
    commentId,
    commentText,
    commentType,
    timestamp,
}) => {
    const [form] = Form.useForm<{
        issueTitle: string;
        issueDescription: string;
    }>();

    const { project_id } = useParams<{
        project_id: string;
    }>();

    const [selectedIssueServices, setSelectedIssueServices] = useState([]);
    const { admin } = useAuthContext();

    const [loading, setLoading] = useState(false);

    const [
        createIssueForSessionComment,
    ] = useCreateIssueForSessionCommentMutation();

    const [
        createIssueForErrorComment,
    ] = useCreateIssueForErrorCommentMutation();

    const currentUrl = `${
        window.location.port !== ''
            ? 'https://app.highlight.run'
            : window.location.origin
    }${window.location.pathname}`;

    useEffect(() => {
        form.setFields([
            {
                name: 'issueDescription',
                value: commentText,
            },
        ]);
    }, [form, commentText]);

    const onFinish = async () => {
        setLoading(true);
        try {
            if (commentType === 'SessionComment') {
                await createIssueForSessionComment({
                    variables: {
                        project_id: project_id,
                        session_url: currentUrl,
                        session_comment_id: commentId,
                        text_for_attachment: commentText || 'Open in Highight',
                        issue_title: form.getFieldValue('issueTitle'),
                        issue_description: form.getFieldValue(
                            'issueDescription'
                        ),
                        integrations: selectedIssueServices,
                        author_name: admin?.name || admin?.email || 'Someone',
                        time: timestamp || 0,
                    },
                });
            } else if (commentType === 'ErrorComment') {
                await createIssueForErrorComment({
                    variables: {
                        project_id: project_id,
                        error_url: currentUrl,
                        error_comment_id: commentId,
                        text_for_attachment: commentText || 'Open in Highight',
                        issue_title: form.getFieldValue('issueTitle'),
                        issue_description: form.getFieldValue(
                            'issueDescription'
                        ),
                        integrations: selectedIssueServices,
                        author_name: admin?.name || admin?.email || 'Someone',
                    },
                });
            } else {
                throw new Error('Invalid Comment Type: ' + commentType);
            }
            changeVisible(false);
            form.resetFields();
            message.success('New Issue Created!');
        } catch (e: any) {
            H.consumeError(e);
            console.error(e);
            message.error('Failed to create an issue. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onFormChangeHandler: React.KeyboardEventHandler<HTMLFormElement> = (
        e
    ) => {
        if (e.key === 'Enter' && e.metaKey) {
            onFinish();
        }
    };

    return (
        <Modal
            title="Create a new Issue"
            visible={visible}
            onCancel={() => changeVisible(false)}
        >
            <ModalBody>
                <Form
                    name="newComment"
                    onFinish={onFinish}
                    form={form}
                    layout="vertical"
                    onKeyDown={onFormChangeHandler}
                >
                    <div>
                        <Form.Item name="integrations" label="Issue Services">
                            <Select
                                aria-label="Comment tags"
                                allowClear={true}
                                defaultActiveFirstOption
                                placeholder={'Issue Services'}
                                mode="multiple"
                                options={[
                                    {
                                        displayValue: 'Create a Linear issue',
                                        id: 'linear',
                                        value: 'Linear',
                                    },
                                ]}
                                onChange={setSelectedIssueServices}
                                notFoundContent={
                                    <p>
                                        <Link to="../integrations">
                                            Add issue tracker integrations
                                        </Link>{' '}
                                        and then it should show up here
                                    </p>
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            name="issueTitle"
                            initialValue="New issue in Highlight session"
                            label="Issue Title"
                        >
                            <Input placeholder="Issue Title" />
                        </Form.Item>
                        <Form.Item
                            name="issueDescription"
                            label="Issue Description"
                        >
                            <TextArea
                                placeholder="Issue Description"
                                rows={3}
                            />
                        </Form.Item>
                        <div className={styles.actionButtons}>
                            <Button
                                trackingId="CreateIssueCancel"
                                htmlType="submit"
                                onClick={() => changeVisible(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                trackingId="createIssueSubmit"
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                disabled={selectedIssueServices.length <= 0}
                            >
                                Create Issue
                            </Button>
                        </div>
                    </div>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export default NewIssueModal;

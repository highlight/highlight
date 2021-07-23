import { Form, Menu, message } from 'antd';
import { H } from 'highlight.run';
import React, { useMemo, useState } from 'react';
import { OnChangeHandlerFunc } from 'react-mentions';
import { useParams } from 'react-router-dom';

import Button from '../../../../components/Button/Button/Button';
import {
    AdminSuggestion,
    CommentHeader,
    parseAdminSuggestions,
} from '../../../../components/Comment/CommentHeader';
import {
    useCreateErrorCommentMutation,
    useDeleteErrorCommentMutation,
    useGetAdminQuery,
    useGetAdminsQuery,
    useGetErrorCommentsQuery,
} from '../../../../graph/generated/hooks';
import { SanitizedAdminInput } from '../../../../graph/generated/schemas';
import CommentTextBody from '../../../Player/Toolbar/NewCommentEntry/CommentTextBody/CommentTextBody';
import styles from '../../ErrorPage.module.scss';

const ErrorComments = () => {
    const { error_id, organization_id } = useParams<{
        error_id: string;
        organization_id: string;
    }>();
    const { data: errorCommentsData } = useGetErrorCommentsQuery({
        variables: {
            error_group_id: error_id,
        },
    });
    const { data: admin_data } = useGetAdminQuery({ skip: false });
    const [createComment] = useCreateErrorCommentMutation();
    const [commentText, setCommentText] = useState('');
    const [commentTextForEmail, setCommentTextForEmail] = useState('');
    const [isCreatingComment, setIsCreatingComment] = useState(false);
    const [form] = Form.useForm<{ commentText: string }>();
    const { data } = useGetAdminsQuery({
        variables: { organization_id },
    });
    const [mentionedAdmins, setMentionedAdmins] = useState<
        SanitizedAdminInput[]
    >([]);

    const onFinish = async () => {
        H.track('Create Error Comment');
        setIsCreatingComment(true);
        try {
            await createComment({
                variables: {
                    organization_id,
                    error_group_id: error_id,
                    text: commentText.trim(),
                    text_for_email: commentTextForEmail.trim(),
                    admin_id: admin_data?.admin?.id || 'Unknown',
                    error_url: `${window.location.origin}${window.location.pathname}`,
                    tagged_admins: mentionedAdmins,
                    author_name:
                        admin_data?.admin?.name ||
                        admin_data?.admin?.email ||
                        'Someone',
                },
                refetchQueries: ['GetErrorComments'],
            });
            form.resetFields();
            setCommentText('');
        } catch (e) {
            H.track('Create Error Comment Failed', { error: e });
            message.error(
                <>
                    Failed to post a comment, please try again. If this keeps
                    failing please message us on{' '}
                    <span
                        className={styles.intercomLink}
                        onClick={() => {
                            window.Intercom(
                                'showNewMessage',
                                `I can't create a comment. This is the error I'm getting: "${e}"`
                            );
                        }}
                    >
                        Intercom
                    </span>
                    .
                </>
            );
        }
        setIsCreatingComment(false);
    };

    const adminSuggestions: AdminSuggestion[] = useMemo(
        () => parseAdminSuggestions(data, admin_data, mentionedAdmins),
        [admin_data, data, mentionedAdmins]
    );

    const onDisplayTransform = (_id: string, display: string): string => {
        return display;
    };

    const onChangeHandler: OnChangeHandlerFunc = (
        e,
        _newValue,
        newPlainTextValue,
        mentions
    ) => {
        setCommentTextForEmail(newPlainTextValue);

        setMentionedAdmins(
            mentions.map((mention) => {
                const admin = data?.admins?.find((admin) => {
                    return admin?.id === mention.id;
                });
                return { id: mention.id, email: admin?.email || '' };
            })
        );
        setCommentText(e.target.value);
    };

    const onFormChangeHandler: React.KeyboardEventHandler<HTMLFormElement> = (
        e
    ) => {
        if (e.key === 'Enter' && e.metaKey) {
            onFinish();
        }
    };

    return (
        <>
            <div className={styles.commentsContainer}>
                {errorCommentsData?.error_comments.map(
                    (comment) =>
                        comment && (
                            <ErrorComment key={comment.id} comment={comment} />
                        )
                )}
            </div>
            <Form
                name="newComment"
                onFinish={onFinish}
                form={form}
                onKeyDown={onFormChangeHandler}
            >
                <div className={styles.commentInputDiv}>
                    <Form.Item
                        name="commentText"
                        wrapperCol={{ span: 24 }}
                        style={{ margin: 0, flexGrow: 1 }}
                    >
                        <div className={styles.commentInputContainer}>
                            <CommentTextBody
                                commentText={commentText}
                                onChangeHandler={onChangeHandler}
                                placeholder={`Add a comment...`}
                                suggestions={adminSuggestions}
                                onDisplayTransformHandler={onDisplayTransform}
                            />
                        </div>
                    </Form.Item>
                    <Form.Item
                        shouldUpdate
                        wrapperCol={{ span: 24 }}
                        className={styles.actionButtonsContainer}
                        style={{ margin: 0 }}
                    >
                        {/* This Form.Item by default are optimized to not rerender the children. For this child however, we want to rerender on every form change to change the disabled state of the button. See https://ant.design/components/form/#shouldUpdate */}
                        {() => (
                            <div className={styles.actionButtons}>
                                <Button
                                    trackingId="CreateErrorComment"
                                    type="primary"
                                    htmlType="submit"
                                    disabled={commentText.length === 0}
                                    loading={isCreatingComment}
                                >
                                    Post
                                </Button>
                            </div>
                        )}
                    </Form.Item>
                </div>
            </Form>
        </>
    );
};

const ErrorComment = ({ comment }: any) => (
    <div className={styles.commentDiv}>
        <ErrorCommentHeader comment={comment}>
            <CommentTextBody commentText={comment.text} />
        </ErrorCommentHeader>
    </div>
);

const ErrorCommentHeader = ({ comment, children }: any) => {
    const [deleteSessionComment] = useDeleteErrorCommentMutation({
        refetchQueries: ['GetErrorComments'],
    });

    const menu = (
        <Menu>
            <Menu.Item
                onClick={() => {
                    deleteSessionComment({
                        variables: {
                            id: comment.id,
                        },
                    });
                }}
            >
                Delete comment
            </Menu.Item>
        </Menu>
    );

    return (
        <CommentHeader menu={menu} comment={comment}>
            {children}
        </CommentHeader>
    );
};

export default ErrorComments;

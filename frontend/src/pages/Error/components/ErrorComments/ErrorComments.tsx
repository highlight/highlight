import React, { useMemo, useState } from 'react';
import { H } from 'highlight.run';
import { Dropdown, Form, Menu, message } from 'antd';
import styles from '../../ErrorPage.module.scss';
import { useParams } from 'react-router-dom';
import {
    useCreateErrorCommentMutation,
    useDeleteErrorCommentMutation,
    useGetAdminQuery,
    useGetAdminsQuery,
    useGetErrorCommentsQuery,
} from '../../../../graph/generated/hooks';
import { AdminSuggestion } from '../../../Player/Toolbar/NewCommentEntry/CommentTextBody/CommentTextBody';
import CommentTextBody from '../../../Player/Toolbar/NewCommentEntry/CommentTextBody/CommentTextBody';
import { OnChangeHandlerFunc } from 'react-mentions';
import { HiDotsHorizontal } from 'react-icons/hi';
import Button from '../../../../components/Button/Button/Button';
import moment from 'moment';
import classNames from 'classnames';

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
    const [mentionedAdmins, setMentionedAdmins] = useState<string[]>([]);

    const onFinish = async () => {
        H.track('Create Error Comment', {});
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
                    tagged_admin_emails: mentionedAdmins,
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

    const adminSuggestions: AdminSuggestion[] = useMemo(() => {
        if (!data?.admins || !admin_data?.admin) {
            return [];
        }

        return data.admins
            .filter(
                (admin) =>
                    admin!.email !== admin_data.admin!.email &&
                    !mentionedAdmins.includes(admin!.email)
            )
            .map((admin) => {
                return {
                    id: admin!.email,
                    email: admin!.email,
                    photo_url: admin!.photo_url,
                    display: admin?.name || admin!.email,
                    name: admin?.name,
                };
            });
    }, [admin_data?.admin, data?.admins, mentionedAdmins]);

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
        setMentionedAdmins(mentions.map((mention) => mention.id));
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
        <div>
            <div className={styles.commentsContainer}>
                {errorCommentsData?.error_comments.map(
                    (comment) =>
                        comment && (
                            <Comment key={comment.id} comment={comment} />
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
        </div>
    );
};

const Comment = ({ comment }: any) => (
    <div className={styles.commentDiv}>
        <CommentHeader comment={comment} />
        <CommentTextBody commentText={comment.text} />
    </div>
);

const CommentHeader = ({ comment }: any) => {
    const [deleteSessionComment] = useDeleteErrorCommentMutation({
        refetchQueries: ['GetSessionComments'],
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
        <div className={classNames(styles.commentHeader)}>
            <span className={styles.commentAuthor}>
                {comment.author.name || comment.author.email.split('@')[0]}
            </span>
            <span className={styles.commentUpdatedTime}>
                {moment(comment.updated_at).fromNow()}
            </span>
            <span className={styles.endActions}>
                <Dropdown
                    overlay={menu}
                    placement="bottomLeft"
                    trigger={['click']}
                >
                    <button className={styles.ellipsisButton}>
                        <HiDotsHorizontal />
                    </button>
                </Dropdown>
            </span>
        </div>
    );
};

export default ErrorComments;

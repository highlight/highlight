import { namedOperations } from '@graph/operations';
import { getCommentMentionSuggestions } from '@util/comment/util';
import { useParams } from '@util/react-router/useParams';
import { Form, Menu, message } from 'antd';
import { H } from 'highlight.run';
import React, { useMemo, useState } from 'react';
import { OnChangeHandlerFunc } from 'react-mentions';

import { useAuthContext } from '../../../../authentication/AuthContext';
import Button from '../../../../components/Button/Button/Button';
import {
    AdminSuggestion,
    CommentHeader,
    parseAdminSuggestions,
} from '../../../../components/Comment/CommentHeader';
import {
    useCreateErrorCommentMutation,
    useDeleteErrorCommentMutation,
    useGetAdminsQuery,
    useGetCommentMentionSuggestionsQuery,
} from '../../../../graph/generated/hooks';
import {
    SanitizedAdminInput,
    SanitizedSlackChannelInput,
} from '../../../../graph/generated/schemas';
import CommentTextBody from '../../../Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody';
import styles from '../../ErrorPage.module.scss';

interface Props {
    parentRef?: React.RefObject<HTMLDivElement>;
}
const ErrorComments = ({ parentRef }: Props) => {
    const { error_id, project_id } = useParams<{
        error_id: string;
        project_id: string;
    }>();
    const { admin } = useAuthContext();
    const [createComment] = useCreateErrorCommentMutation();
    const {
        data: mentionSuggestionsData,
    } = useGetCommentMentionSuggestionsQuery({
        variables: { project_id },
    });
    const [commentText, setCommentText] = useState('');
    const [commentTextForEmail, setCommentTextForEmail] = useState('');
    const [isCreatingComment, setIsCreatingComment] = useState(false);
    const [form] = Form.useForm<{ commentText: string }>();
    const { data } = useGetAdminsQuery({
        variables: { project_id },
    });
    const [mentionedAdmins, setMentionedAdmins] = useState<
        SanitizedAdminInput[]
    >([]);
    const [mentionedSlackUsers, setMentionedSlackUsers] = useState<
        SanitizedSlackChannelInput[]
    >([]);

    const onFinish = async () => {
        H.track('Create Error Comment', {
            numHighlightAdminMentions: mentionedAdmins.length,
            numSlackMentions: mentionedSlackUsers.length,
        });
        setIsCreatingComment(true);
        try {
            await createComment({
                variables: {
                    project_id,
                    error_group_id: error_id,
                    text: commentText.trim(),
                    text_for_email: commentTextForEmail.trim(),
                    error_url: `${window.location.origin}${window.location.pathname}`,
                    tagged_admins: mentionedAdmins,
                    tagged_slack_users: mentionedSlackUsers,
                    author_name: admin?.name || admin?.email || 'Someone',
                },
                refetchQueries: [namedOperations.Query.GetErrorComments],
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
        () =>
            parseAdminSuggestions(
                getCommentMentionSuggestions(mentionSuggestionsData),
                admin,
                mentionedAdmins
            ),
        [admin, mentionSuggestionsData, mentionedAdmins]
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
            mentions
                .filter(
                    (mention) =>
                        !mention.display.includes('@') &&
                        !mention.display.includes('#')
                )
                .map((mention) => {
                    const admin = data?.admins?.find((admin) => {
                        return admin?.id === mention.id;
                    });
                    return { id: mention.id, email: admin?.email || '' };
                })
        );
        if (mentionSuggestionsData?.slack_members) {
            setMentionedSlackUsers(
                mentions
                    .filter(
                        (mention) =>
                            mention.display.includes('@') ||
                            mention.display.includes('#')
                    )
                    .map<SanitizedSlackChannelInput>((mention) => {
                        const matchingSlackUser = mentionSuggestionsData.slack_members.find(
                            (slackUser) => {
                                return (
                                    slackUser?.webhook_channel_id === mention.id
                                );
                            }
                        );

                        return {
                            webhook_channel_id:
                                matchingSlackUser?.webhook_channel_id,
                            webhook_channel_name:
                                matchingSlackUser?.webhook_channel,
                        };
                    })
            );
        }
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
                                suggestionsPortalHost={
                                    parentRef?.current as Element
                                }
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

export const ErrorCommentCard = ({ comment }: any) => (
    <div className={styles.commentDiv}>
        <ErrorCommentHeader comment={comment}>
            <CommentTextBody commentText={comment.text} />
        </ErrorCommentHeader>
    </div>
);

const ErrorCommentHeader = ({ comment, children }: any) => {
    const [deleteSessionComment] = useDeleteErrorCommentMutation({
        refetchQueries: [namedOperations.Query.GetErrorComments],
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

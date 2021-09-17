import { namedOperations } from '@graph/operations';
import { getCommentMentionSuggestions } from '@util/comment/util';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import { useParams } from '@util/react-router/useParams';
import { Form, message } from 'antd';
import { H } from 'highlight.run';
import React, { useMemo, useState } from 'react';
import { OnChangeHandlerFunc } from 'react-mentions';

import { useAuthContext } from '../../../../authentication/AuthContext';
import Button from '../../../../components/Button/Button/Button';
import {
    AdminSuggestion,
    parseAdminSuggestions,
} from '../../../../components/Comment/CommentHeader';
import {
    useCreateSessionCommentMutation,
    useGetAdminsQuery,
    useGetCommentMentionSuggestionsQuery,
} from '../../../../graph/generated/hooks';
import {
    SanitizedAdminInput,
    SanitizedSlackChannelInput,
} from '../../../../graph/generated/schemas';
import { MillisToMinutesAndSeconds } from '../../../../util/time';
import { Coordinates2D } from '../../PlayerCommentCanvas/PlayerCommentCanvas';
import usePlayerConfiguration from '../../PlayerHook/utils/usePlayerConfiguration';
import { useReplayerContext } from '../../ReplayerContext';
import CommentTextBody from './CommentTextBody/CommentTextBody';
import styles from './NewCommentForm.module.scss';
// import html2canvas from 'html2canvas';

interface Props {
    currentTime: number;
    onCloseHandler: () => void;
    commentPosition: Coordinates2D | undefined;
    parentRef?: React.RefObject<HTMLDivElement>;
}

export const NewCommentForm = ({
    currentTime,
    onCloseHandler,
    commentPosition,
    parentRef,
}: Props) => {
    const { time } = useReplayerContext();
    const [createComment] = useCreateSessionCommentMutation();
    const { admin, isLoggedIn, isHighlightAdmin } = useAuthContext();
    const { session_id, organization_id } = useParams<{
        session_id: string;
        organization_id: string;
    }>();
    const [commentText, setCommentText] = useState('');
    /**
     * commentTextForEmail is the comment text without the formatting.
     * For example, the display string of "hello foobar how are you?" is persisted as "hello @[foobar](foobar@example.com) how are you?"
     */
    const [commentTextForEmail, setCommentTextForEmail] = useState('');
    const [isCreatingComment, setIsCreatingComment] = useState(false);
    const [form] = Form.useForm<{ commentText: string }>();
    const {
        selectedTimelineAnnotationTypes,
        setSelectedTimelineAnnotationTypes,
    } = usePlayerConfiguration();
    const { data: adminsInOrganization } = useGetAdminsQuery({
        variables: { organization_id },
    });
    const {
        data: mentionSuggestionsData,
    } = useGetCommentMentionSuggestionsQuery({
        variables: { organization_id },
        skip: !isHighlightAdmin,
    });
    const [mentionedAdmins, setMentionedAdmins] = useState<
        SanitizedAdminInput[]
    >([]);
    const [mentionedSlackUsers, setMentionedSlackUsers] = useState<
        SanitizedSlackChannelInput[]
    >([]);

    const onFinish = async () => {
        H.track('Create Comment');
        setIsCreatingComment(true);
        // const canvas = await html2canvas(
        //     (document.querySelector(
        //         '.replayer-wrapper iframe'
        //     ) as HTMLIFrameElement).contentDocument!.documentElement,
        //     {
        //         allowTaint: true,
        //         logging: false,
        //         backgroundColor: null,
        //     }
        // );
        try {
            await createComment({
                variables: {
                    organization_id,
                    session_id,
                    session_timestamp: Math.floor(currentTime),
                    text: commentText.trim(),
                    text_for_email: commentTextForEmail.trim(),
                    x_coordinate: commentPosition?.x || 0,
                    y_coordinate: commentPosition?.y || 0,
                    session_url: `${window.location.origin}${window.location.pathname}`,
                    tagged_admins: mentionedAdmins,
                    tagged_slack_users: mentionedSlackUsers,
                    time: time / 1000,
                    author_name: admin?.name || admin?.email || 'Someone',
                    // session_image: canvas
                    //     .toDataURL()
                    //     .replace('data:image/png;base64,', ''),
                },
                refetchQueries: [namedOperations.Query.GetSessionComments],
            });
            onCloseHandler();
            form.resetFields();
            if (!selectedTimelineAnnotationTypes.includes('Comments')) {
                setSelectedTimelineAnnotationTypes([
                    ...selectedTimelineAnnotationTypes,
                    'Comments',
                ]);
            }
        } catch (e) {
            H.track('Create Comment Failed', { error: e });
            message.error(
                <>
                    Failed to post a comment, please try again.{' '}
                    {!isOnPrem ? (
                        <>
                            If this keeps failing please message us on{' '}
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
                    ) : (
                        <>If this keeps failing please reach out to us!</>
                    )}
                </>
            );
        }
        setIsCreatingComment(false);
    };

    const adminSuggestions: AdminSuggestion[] = useMemo(
        () =>
            // Guests cannot @mention a admin.
            isLoggedIn
                ? parseAdminSuggestions(
                      getCommentMentionSuggestions(mentionSuggestionsData),
                      admin,
                      mentionedAdmins
                  )
                : [],
        [admin, isLoggedIn, mentionSuggestionsData, mentionedAdmins]
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
                const admin = adminsInOrganization?.admins?.find((admin) => {
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
        <Form
            name="newComment"
            onFinish={onFinish}
            form={form}
            onKeyDown={onFormChangeHandler}
        >
            <Form.Item name="commentText" wrapperCol={{ span: 24 }}>
                <div className={styles.commentInputContainer}>
                    <CommentTextBody
                        commentText={commentText}
                        onChangeHandler={onChangeHandler}
                        placeholder={`Add a comment at ${MillisToMinutesAndSeconds(
                            currentTime
                        )}`}
                        suggestions={adminSuggestions}
                        onDisplayTransformHandler={onDisplayTransform}
                        suggestionsPortalHost={parentRef?.current as Element}
                    />
                </div>
            </Form.Item>
            <Form.Item
                shouldUpdate
                wrapperCol={{ span: 24 }}
                className={styles.actionButtonsContainer}
            >
                {/* This Form.Item by default are optimized to not rerender the children. For this child however, we want to rerender on every form change to change the disabled state of the button. See https://ant.design/components/form/#shouldUpdate */}
                {() => (
                    <div className={styles.actionButtons}>
                        <Button
                            trackingId="CancelCreatingSessionComment"
                            htmlType="button"
                            onClick={() => {
                                onCloseHandler();
                                form.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            trackingId="CreateNewSessionComment"
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
        </Form>
    );
};

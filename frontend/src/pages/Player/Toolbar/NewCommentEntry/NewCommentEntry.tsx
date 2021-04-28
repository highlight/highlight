import React, { useContext, useMemo, useState } from 'react';
import {
    useCreateSessionCommentMutation,
    useGetAdminQuery,
    useGetAdminsQuery,
} from '../../../../graph/generated/hooks';
import { Form } from 'antd';
import { useParams } from 'react-router-dom';
import styles from './NewCommentEntry.module.scss';
import { MillisToMinutesAndSeconds } from '../../../../util/time';
import { Coordinates2D } from '../../CommentButton/CommentButton';
import useLocalStorage from '@rehooks/local-storage';
import { EventsForTimeline } from '../../PlayerHook/utils';
import ReplayerContext from '../../ReplayerContext';
import { H } from 'highlight.run';
import { OnChangeHandlerFunc } from 'react-mentions';
import CommentTextBody from './CommentTextBody/CommentTextBody';
import Button from '../../../../components/Button/Button/Button';
import { AdminSuggestion } from './CommentTextBody/CommentTextBody';
// import html2canvas from 'html2canvas';

interface Props {
    currentTime: number;
    onCloseHandler: () => void;
    commentPosition: Coordinates2D | undefined;
    parentRef?: React.RefObject<HTMLDivElement>;
}

export const NewCommentEntry = ({
    currentTime,
    onCloseHandler,
    commentPosition,
    parentRef,
}: Props) => {
    const { time } = useContext(ReplayerContext);
    const [createComment] = useCreateSessionCommentMutation();
    const { data: admin_data } = useGetAdminQuery({ skip: false });
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
    const [
        selectedTimelineAnnotationTypes,
        setSelectedTimelineAnnotationTypes,
    ] = useLocalStorage('highlightTimelineAnnotationTypes', [
        ...EventsForTimeline,
    ]);
    const { data } = useGetAdminsQuery({
        variables: { organization_id },
    });
    const [mentionedAdmins, setMentionedAdmins] = useState<string[]>([]);

    const onFinish = async () => {
        H.track('Create Comment', {});
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
        await createComment({
            variables: {
                organization_id,
                session_id,
                session_timestamp: Math.floor(currentTime),
                text: commentText.trim(),
                text_for_email: commentTextForEmail.trim(),
                admin_id: admin_data?.admin?.id || 'Unknown',
                x_coordinate: commentPosition?.x || 0,
                y_coordinate: commentPosition?.y || 0,
                session_url: `${window.location.origin}${window.location.pathname}`,
                tagged_admin_emails: mentionedAdmins,
                time: time / 1000,
                author_name:
                    admin_data?.admin?.name ||
                    admin_data?.admin?.email ||
                    'Someone',
                // session_image: canvas
                //     .toDataURL()
                //     .replace('data:image/png;base64,', ''),
            },
            refetchQueries: ['GetSessionComments'],
        });
        onCloseHandler();
        form.resetFields();
        if (!selectedTimelineAnnotationTypes.includes('Comments')) {
            setSelectedTimelineAnnotationTypes([
                ...selectedTimelineAnnotationTypes,
                'Comments',
            ]);
        }
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

    return (
        <Form name="newComment" onFinish={onFinish} form={form}>
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
                            htmlType="button"
                            onClick={() => {
                                onCloseHandler();
                                form.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
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
        </Form>
    );
};

import React, { useContext, useState } from 'react';
import {
    useCreateSessionCommentMutation,
    useGetAdminQuery,
    useGetAdminsQuery,
} from '../../../../graph/generated/hooks';
import { Form, Mentions } from 'antd';
const { Option, getMentions } = Mentions;
import { useParams } from 'react-router-dom';
import styles from './NewCommentEntry.module.scss';
import PrimaryButton from '../../../../components/Button/PrimaryButton/PrimaryButton';
import SecondaryButton from '../../../../components/Button/SecondaryButton/SecondaryButton';
import { MillisToMinutesAndSeconds } from '../../../../util/time';
import { Coordinates2D } from '../../CommentButton/CommentButton';
import useLocalStorage from '@rehooks/local-storage';
import { EventsForTimeline } from '../../PlayerHook/utils';
import ReplayerContext from '../../ReplayerContext';

interface Props {
    currentTime: number;
    onCloseHandler: () => void;
    commentPosition: Coordinates2D | undefined;
}

export const NewCommentEntry = ({
    currentTime,
    onCloseHandler,
    commentPosition,
}: Props) => {
    const { time } = useContext(ReplayerContext);
    const [createComment] = useCreateSessionCommentMutation();
    const { data: admin_data } = useGetAdminQuery({ skip: false });
    const { session_id, organization_id } = useParams<{
        session_id: string;
        organization_id: string;
    }>();
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

    const onFinish = (values: { commentText: string }) => {
        const taggedAdmins = getMentions(values.commentText).map(
            (entity) => entity.value
        );
        createComment({
            variables: {
                organization_id,
                session_id,
                session_timestamp: Math.floor(currentTime),
                text: values.commentText,
                admin_id: admin_data?.admin?.id || 'Unknown',
                x_coordinate: commentPosition?.x || 0,
                y_coordinate: commentPosition?.y || 0,
                session_url: `${window.location.origin}${window.location.pathname}`,
                tagged_admin_emails: taggedAdmins,
                time: time / 1000,
                author_name:
                    admin_data?.admin?.name ||
                    admin_data?.admin?.email ||
                    'Someone',
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

    // Watch as new mentions get added. We use this to filter the list of suggested mentions to remove admins who are already mentioned.
    const onValuesChange = ({ commentText }: { commentText: string }) => {
        const mentions = getMentions(commentText);
        setMentionedAdmins(mentions.map((mention) => mention.value));
    };

    return (
        <Form
            name="newComment"
            onFinish={onFinish}
            onValuesChange={onValuesChange}
            form={form}
        >
            <Form.Item name="commentText" wrapperCol={{ span: 24 }}>
                <Mentions
                    rows={3}
                    maxLength={200}
                    placeholder={`Add a comment at ${MillisToMinutesAndSeconds(
                        currentTime
                    )}`}
                    autoFocus
                    notFoundContent={'No users matching search'}
                >
                    {data?.admins?.map((admin) => {
                        if (
                            admin?.email &&
                            (mentionedAdmins.includes(admin.email) ||
                                admin_data?.admin?.email === admin.email)
                        ) {
                            return null;
                        }
                        return (
                            <Option value={admin?.email} key={admin?.id}>
                                {admin?.name || admin?.email}
                            </Option>
                        );
                    })}
                </Mentions>
            </Form.Item>
            <Form.Item
                shouldUpdate
                wrapperCol={{ span: 24 }}
                className={styles.actionButtonsContainer}
            >
                {/* This Form.Item by default are optimized to not rerender the children. For this child however, we want to rerender on every form change to change the disabled state of the button. See https://ant.design/components/form/#shouldUpdate */}
                {() => (
                    <div className={styles.actionButtons}>
                        <SecondaryButton
                            type="button"
                            onClick={() => {
                                onCloseHandler();
                                form.resetFields();
                            }}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={
                                !form.getFieldValue('commentText')?.length ||
                                !form.isFieldsTouched(true) ||
                                !!form
                                    .getFieldsError()
                                    .filter(({ errors }) => errors.length)
                                    .length
                            }
                        >
                            Post
                        </PrimaryButton>
                    </div>
                )}
            </Form.Item>
        </Form>
    );
};

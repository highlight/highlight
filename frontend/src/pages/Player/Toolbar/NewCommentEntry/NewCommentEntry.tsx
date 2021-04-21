import React from 'react';
import {
    useCreateSessionCommentMutation,
    useGetAdminQuery,
} from '../../../../graph/generated/hooks';
import { Input, Form } from 'antd';
import { useParams } from 'react-router-dom';
import styles from './NewCommentEntry.module.scss';
import PrimaryButton from '../../../../components/Button/PrimaryButton/PrimaryButton';
import SecondaryButton from '../../../../components/Button/SecondaryButton/SecondaryButton';
import { MillisToMinutesAndSeconds } from '../../../../util/time';
import { Coordinates2D } from '../../CommentButton/CommentButton';
import useLocalStorage from '@rehooks/local-storage';
import { EventsForTimeline } from '../../PlayerHook/utils';

const { TextArea } = Input;

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

    const onFinish = (values: { commentText: string }) => {
        createComment({
            variables: {
                organization_id,
                session_id,
                session_timestamp: Math.floor(currentTime),
                text: values.commentText,
                admin_id: admin_data?.admin?.id || 'Unknown',
                x_coordinate: commentPosition?.x || 0,
                y_coordinate: commentPosition?.y || 0,
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

    return (
        <Form name="newComment" onFinish={onFinish} form={form}>
            <Form.Item name="commentText" wrapperCol={{ span: 24 }}>
                <TextArea
                    maxLength={200}
                    bordered={false}
                    placeholder={`Add a comment at ${MillisToMinutesAndSeconds(
                        currentTime
                    )}`}
                    autoSize
                    autoFocus
                />
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

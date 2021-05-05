import React, { useState } from 'react';
import Button from '../../Button/Button/Button';
import Popover from '../../Popover/Popover';
import { FaBell } from 'react-icons/fa';
import styles from './Notification.module.scss';
import { useGetNotificationsQuery } from '../../../graph/generated/hooks';
import PopoverListContent from '../../Popover/PopoverListContent';
import CommentNotification from './CommentNotification/CommentNotification';

const Notifications = () => {
    const [commentNotifications, setCommentNotifications] = useState<any[]>([]);
    const { loading } = useGetNotificationsQuery({
        onCompleted: (data) => {
            if (data?.session_comments_for_admin.length) {
                setCommentNotifications(
                    [...data.session_comments_for_admin].sort((a, b) => {
                        return (
                            new Date(b?.updated_at || 0).getTime() -
                            new Date(a?.updated_at || 0).getTime()
                        );
                    })
                );
            }
        },
        pollInterval: 1000 * 30,
    });

    if (loading) {
        return null;
    }

    return (
        <Popover
            hasBorder
            placement="bottomLeft"
            visible
            isList
            content={
                <div className={styles.popover}>
                    <PopoverListContent
                        listItems={commentNotifications.map(
                            (comment, index) => (
                                <CommentNotification
                                    comment={comment}
                                    key={comment?.id || index}
                                />
                            )
                        )}
                    />
                </div>
            }
        >
            <Button type="text" className={styles.button}>
                <FaBell />
            </Button>
        </Popover>
    );
};

export default Notifications;

import React, { useState } from 'react';
import Button from '../../Button/Button/Button';
import Popover from '../../Popover/Popover';
import styles from './Notification.module.scss';
import { useGetNotificationsQuery } from '../../../graph/generated/hooks';
import PopoverListContent from '../../Popover/PopoverListContent';
import NotificationItem from './NotificationItem/NotificationItem';
import { processNotifications } from './utils/utils';
import SvgBellIcon from '../../../static/BellIcon';

const Notifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const { loading } = useGetNotificationsQuery({
        onCompleted: (data) => {
            if (data) {
                setNotifications(processNotifications(data));
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
                        listItems={notifications.map((notification, index) => (
                            <NotificationItem
                                notification={notification}
                                key={notification?.id || index}
                            />
                        ))}
                    />
                </div>
            }
        >
            <Button type="text" className={styles.button}>
                <SvgBellIcon />
            </Button>
        </Popover>
    );
};

export default Notifications;

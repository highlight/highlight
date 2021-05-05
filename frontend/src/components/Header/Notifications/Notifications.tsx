import React, { useEffect, useState } from 'react';
import Button from '../../Button/Button/Button';
import Popover from '../../Popover/Popover';
import styles from './Notification.module.scss';
import { useGetNotificationsQuery } from '../../../graph/generated/hooks';
import PopoverListContent from '../../Popover/PopoverListContent';
import NotificationItem from './NotificationItem/NotificationItem';
import { processNotifications } from './utils/utils';
import SvgBellIcon from '../../../static/BellIcon';
import useLocalStorage from '@rehooks/local-storage';
import SvgBellFilledIcon from '../../../static/BellFilledIcon';
import classNames from 'classnames';

const Notifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [
        unreadNotificationsCount,
        setUnreadNotificationsCount,
    ] = useState<number>(0);
    const [readNotifications, setReadNotifications] = useLocalStorage<string[]>(
        'highlight-read-notifications',
        []
    );
    const { loading } = useGetNotificationsQuery({
        onCompleted: (data) => {
            if (data) {
                const processedNotifications = processNotifications(data);
                setNotifications(processedNotifications);
            }
        },
        pollInterval: 1000 * 30,
    });

    useEffect(() => {
        const unreadCount = notifications.reduce((prev, curr) => {
            return readNotifications.includes(curr.id) ? prev : prev + 1;
        }, 0);
        setUnreadNotificationsCount(unreadCount);
    }, [notifications, readNotifications]);

    if (loading) {
        return null;
    }

    return (
        <Popover
            hasBorder
            placement="bottomLeft"
            isList
            content={
                <div className={styles.popover}>
                    <PopoverListContent
                        listItems={notifications.map((notification, index) => (
                            <NotificationItem
                                notification={notification}
                                key={notification?.id || index}
                                viewed={readNotifications.includes(
                                    notification.id
                                )}
                                onViewHandler={() => {
                                    if (notification.id) {
                                        setReadNotifications([
                                            ...readNotifications,
                                            notification.id.toString(),
                                        ]);
                                    }
                                }}
                            />
                        ))}
                    />
                </div>
            }
        >
            <div className={styles.buttonContainer}>
                <Button
                    type="text"
                    className={classNames(styles.button, {
                        [styles.hasUnreadNotifications]: unreadNotificationsCount,
                    })}
                >
                    {unreadNotificationsCount ? (
                        <SvgBellFilledIcon />
                    ) : (
                        <SvgBellIcon />
                    )}
                </Button>
                {unreadNotificationsCount !== 0 && (
                    <p>{unreadNotificationsCount}</p>
                )}
            </div>
        </Popover>
    );
};

export default Notifications;

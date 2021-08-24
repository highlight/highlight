import useLocalStorage from '@rehooks/local-storage';
import { Menu } from 'antd';
import classNames from 'classnames';
import { H } from 'highlight.run';
import Lottie from 'lottie-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGetNotificationsQuery } from '../../../graph/generated/hooks';
import NotificationAnimation from '../../../lottie/waiting.json';
import SvgBellIcon from '../../../static/BellIcon';
import Button from '../../Button/Button/Button';
import Dot from '../../Dot/Dot';
import DotsMenu from '../../DotsMenu/DotsMenu';
import Popover from '../../Popover/Popover';
import PopoverListContent from '../../Popover/PopoverListContent';
import styles from './Notification.module.scss';
import NotificationItem from './NotificationItem/NotificationItem';
import { processNotifications } from './utils/utils';

const Notifications = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showPopover, setShowPopover] = useState(false);
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
        // pollInterval: 1000 * 30,
        variables: {
            organization_id,
        },
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
            isList
            visible={showPopover}
            trigger={['click']}
            content={
                <div className={styles.popover}>
                    {notifications.length !== 0 ? (
                        <PopoverListContent
                            listItems={notifications.map(
                                (notification, index) => (
                                    <NotificationItem
                                        notification={notification}
                                        key={notification?.id || index}
                                        viewed={readNotifications.includes(
                                            notification.id
                                        )}
                                        onViewHandler={() => {
                                            setShowPopover(false);
                                            if (notification.id) {
                                                H.track(
                                                    'Clicked on notification item',
                                                    {}
                                                );
                                                setReadNotifications([
                                                    ...readNotifications,
                                                    notification.id.toString(),
                                                ]);
                                            }
                                        }}
                                    />
                                )
                            )}
                        />
                    ) : (
                        <div className={styles.emptyStateContainer}>
                            <Lottie
                                animationData={NotificationAnimation}
                                className={styles.animation}
                            />
                            <p>
                                Comments made in your organization will show up
                                here. Get started by mentioning a team member on
                                an error or a session.
                            </p>
                        </div>
                    )}
                </div>
            }
            onVisibleChange={(visible) => {
                if (visible) {
                    H.track('Viewed notifications');
                }
                setShowPopover(visible);
            }}
            title={
                <div className={styles.popoverTitle}>
                    <h3>Comments</h3>
                    <DotsMenu
                        trackingId="MarkAllNotificationsAsRead"
                        menu={
                            <Menu>
                                <Menu.Item
                                    onClick={() => {
                                        setReadNotifications([
                                            ...notifications.map(
                                                (notification) =>
                                                    notification.id.toString()
                                            ),
                                        ]);
                                    }}
                                >
                                    Mark all as read
                                </Menu.Item>
                                <Menu.Item
                                    onClick={() => {
                                        setReadNotifications([]);
                                    }}
                                >
                                    Mark all as unread
                                </Menu.Item>
                            </Menu>
                        }
                    />
                </div>
            }
        >
            <Button
                type="text"
                className={classNames(styles.button)}
                trackingId="OpenMentions"
                iconButton
            >
                <div className={styles.iconContainer}>
                    {unreadNotificationsCount !== 0 && (
                        <div className={styles.dotContainer}>
                            <Dot pulse />
                        </div>
                    )}
                    <SvgBellIcon />
                </div>
            </Button>
        </Popover>
    );
};

export default Notifications;

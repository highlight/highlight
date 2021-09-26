import { useAuthContext } from '@authentication/AuthContext';
import Alert from '@components/Alert/Alert';
import PersonalNotificationButton from '@components/Header/components/PersonalNotificationButton/PersonalNotificationButton';
import useLocalStorage from '@rehooks/local-storage';
import { useParams } from '@util/react-router/useParams';
import { Menu } from 'antd';
import classNames from 'classnames';
import { H } from 'highlight.run';
import Lottie from 'lottie-react';
import React, { useEffect, useState } from 'react';

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
    const { project_id } = useParams<{ project_id: string }>();
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
    const {} = useGetNotificationsQuery({
        onCompleted: (data) => {
            if (data) {
                const processedNotifications = processNotifications(data);
                setNotifications(processedNotifications);
            }
        },
        // pollInterval: 1000 * 30,
        variables: {
            project_id,
        },
    });

    const { admin } = useAuthContext();

    useEffect(() => {
        const unreadCount = notifications.reduce((prev, curr) => {
            return readNotifications.includes(curr.id) ? prev : prev + 1;
        }, 0);
        setUnreadNotificationsCount(unreadCount);
    }, [notifications, readNotifications]);

    return (
        <Popover
            hasBorder
            isList
            visible={showPopover}
            trigger={['click']}
            content={
                <div className={styles.popover}>
                    {notifications.length !== 0 ? (
                        <>
                            {!admin?.slack_im_channel_id && (
                                <Alert
                                    trackingId={
                                        'NotificationsTab-PersonalNotificationCTA'
                                    }
                                    message={'Get Comment Notifications'}
                                    description={
                                        <>
                                            {
                                                'Get a slack DM anytime someone tags you in a Highlight comment!'
                                            }
                                            <PersonalNotificationButton
                                                type="Personal"
                                                text={'Enable Notifications'}
                                                style={{
                                                    marginTop:
                                                        'var(--size-medium)',
                                                }}
                                            />
                                        </>
                                    }
                                    className={styles.personalNotificationAlert}
                                />
                            )}
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
                        </>
                    ) : (
                        <>
                            <div className={styles.emptyStateContainer}>
                                <Lottie
                                    animationData={NotificationAnimation}
                                    className={styles.animation}
                                />
                                <p>
                                    Comments made in your project will show up
                                    here. Get started by mentioning a team
                                    member on an error or a session.
                                </p>
                                <PersonalNotificationButton
                                    text="Get Slack Notifications"
                                    style={{ maxWidth: 'fit-content' }}
                                    type="Personal"
                                />
                            </div>
                        </>
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
                    <div className={styles.dotContainer}>
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

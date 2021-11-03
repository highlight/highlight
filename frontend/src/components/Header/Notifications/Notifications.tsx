import PersonalNotificationButton from '@components/Header/components/PersonalNotificationButton/PersonalNotificationButton';
import Tabs from '@components/Tabs/Tabs';
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
    const [allNotifications, setAllNotifications] = useState<any[]>([]);
    const [inboxNotifications, setInboxNotifications] = useState<any[]>([]);
    const [showPopover, setShowPopover] = useState(false);
    const [readNotifications, setReadNotifications] = useLocalStorage<string[]>(
        'highlight-read-notifications',
        []
    );
    const {} = useGetNotificationsQuery({
        onCompleted: (data) => {
            if (data) {
                const processedNotifications = processNotifications(data);
                setAllNotifications(processedNotifications);
            }
        },
        pollInterval: 1000 * 30,
        variables: {
            project_id,
        },
        skip: !project_id,
    });

    useEffect(() => {
        const unreadNotifications = allNotifications.filter(
            (notification) => !readNotifications.includes(notification.id)
        );
        setInboxNotifications(unreadNotifications);
    }, [allNotifications, readNotifications]);

    return (
        <Popover
            isList
            visible={showPopover}
            trigger={['click']}
            placement="bottomRight"
            content={
                <div className={styles.popover}>
                    <Tabs
                        className={styles.tabs}
                        id="Notifications"
                        tabs={[
                            {
                                key: 'Inbox',
                                title: `Inbox (${inboxNotifications.length})`,
                                panelContent:
                                    inboxNotifications.length !== 0 ? (
                                        <List
                                            notifications={inboxNotifications}
                                            readNotifications={
                                                readNotifications
                                            }
                                            onViewHandler={(
                                                notification: any
                                            ) => {
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
                                    ) : (
                                        <>
                                            <div
                                                className={
                                                    styles.emptyStateContainer
                                                }
                                            >
                                                <Lottie
                                                    animationData={
                                                        NotificationAnimation
                                                    }
                                                    className={styles.animation}
                                                />
                                                <p>
                                                    {allNotifications.length ===
                                                    0
                                                        ? `Comments made in your
								project will show up here.
								Get started by mentioning a
								team member on an error or a
								session.`
                                                        : `You have no unread notifications 🎉`}
                                                </p>
                                                <PersonalNotificationButton
                                                    text="Get Slack Notifications"
                                                    style={{
                                                        maxWidth: 'fit-content',
                                                    }}
                                                    type="Organization"
                                                />
                                            </div>
                                        </>
                                    ),
                            },
                            {
                                key: 'All',
                                title: `All (${allNotifications.length})`,
                                panelContent:
                                    allNotifications.length !== 0 ? (
                                        <List
                                            notifications={allNotifications}
                                            readNotifications={
                                                readNotifications
                                            }
                                            onViewHandler={(
                                                notification: any
                                            ) => {
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
                                    ) : (
                                        <>
                                            <div
                                                className={
                                                    styles.emptyStateContainer
                                                }
                                            >
                                                <Lottie
                                                    animationData={
                                                        NotificationAnimation
                                                    }
                                                    className={styles.animation}
                                                />
                                                <p>
                                                    Comments made in your
                                                    project will show up here.
                                                    Get started by mentioning a
                                                    team member on an error or a
                                                    session.
                                                </p>
                                                <PersonalNotificationButton
                                                    text="Get Slack Notifications"
                                                    style={{
                                                        maxWidth: 'fit-content',
                                                    }}
                                                    type="Organization"
                                                />
                                            </div>
                                        </>
                                    ),
                            },
                        ]}
                        tabBarExtraContent={
                            <DotsMenu
                                trackingId="MarkAllNotificationsAsRead"
                                menu={
                                    <Menu>
                                        <Menu.Item
                                            onClick={() => {
                                                setReadNotifications([
                                                    ...allNotifications.map(
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
                        }
                    />
                </div>
            }
            onVisibleChange={(visible) => {
                if (visible) {
                    H.track('Viewed notifications');
                }
                setShowPopover(visible);
            }}
        >
            <Button
                type="text"
                className={classNames(styles.button)}
                trackingId="OpenMentions"
                iconButton
            >
                <div className={styles.iconContainer}>
                    {inboxNotifications.length !== 0 && (
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

interface ListProps {
    notifications: any[];
    readNotifications: string[];
    onViewHandler: (notification: any) => void;
}

const List = ({
    notifications,
    readNotifications,
    onViewHandler,
}: ListProps) => {
    return (
        <PopoverListContent
            virtual
            virtualListHeight={450}
            listItems={notifications.map((notification, index) => (
                <NotificationItem
                    notification={notification}
                    key={notification?.id || index}
                    viewed={readNotifications.includes(notification.id)}
                    onViewHandler={() => {
                        onViewHandler(notification);
                    }}
                />
            ))}
        />
    );
};

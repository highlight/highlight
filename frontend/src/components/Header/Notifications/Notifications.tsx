import useLocalStorage from '@rehooks/local-storage';
import classNames from 'classnames';
import { H } from 'highlight.run';
import Lottie from 'lottie-react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useGetNotificationsQuery } from '../../../graph/generated/hooks';
import NotificationAnimation from '../../../lottie/waiting.json';
import SvgBellIcon from '../../../static/BellIcon';
import Button from '../../Button/Button/Button';
import Dot from '../../Dot/Dot';
import Popover from '../../Popover/Popover';
import PopoverListContent from '../../Popover/PopoverListContent';
import styles from './Notification.module.scss';
import NotificationItem from './NotificationItem/NotificationItem';
import { processNotifications } from './utils/utils';

const Notifications = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
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
                                You don’t have any mentions yet.{' '}
                                <Link to={`/${organization_id}/team`}>
                                    Invite your team
                                </Link>{' '}
                                to mention them in comments.
                            </p>
                        </div>
                    )}
                </div>
            }
            onVisibleChange={(visible) => {
                if (visible) {
                    H.track('Viewed notifications', {});
                }
            }}
            title={
                <div className={styles.popoverTitle}>
                    <h3>Mentions</h3>
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

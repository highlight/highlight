import moment from 'moment';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { PlayerSearchParameters } from '../../../../pages/Player/PlayerHook/utils';
import CommentTextBody from '../../../../pages/Player/Toolbar/NewCommentEntry/CommentTextBody/CommentTextBody';
import SvgErrorsIcon from '../../../../static/ErrorsIcon';
import SvgMessageIcon from '../../../../static/MessageIcon';
import Dot from '../../../Dot/Dot';
import notificationStyles from '../Notification.module.scss';
import { NotificationType } from '../utils/utils';

interface Props {
    notification: any;
    viewed: boolean;
    onViewHandler: () => void;
}

const CommentNotification = ({
    notification,
    onViewHandler,
    viewed,
}: Props) => {
    const { organization_id } = useParams<{ organization_id: string }>();

    return (
        <Link
            className={notificationStyles.notification}
            to={getLink(notification, organization_id)}
            onClick={onViewHandler}
        >
            <div className={notificationStyles.notificationIconContainer}>
                {getIcon(notification.type)}
            </div>
            <div className={notificationStyles.notificationBody}>
                <h3>{getTitle(notification)}</h3>
                <CommentTextBody
                    commentText={`"${notification?.text || ''}"`}
                />
                {moment(notification?.updated_at).fromNow()}
            </div>
            <div className={notificationStyles.dotContainer}>
                {!viewed && <Dot />}
            </div>
        </Link>
    );
};

export default CommentNotification;

const getIcon = (type: NotificationType) => {
    switch (type) {
        case NotificationType.ErrorComment:
            return <SvgErrorsIcon />;
        case NotificationType.SessionComment:
            return <SvgMessageIcon />;
    }
};

const getTitle = (notification: any) => {
    const notificationAuthor =
        notification?.author.name || notification?.author.email;

    switch (notification.type as NotificationType) {
        case NotificationType.ErrorComment:
            return `${notificationAuthor} commented on an error`;
        case NotificationType.SessionComment:
            return `${notificationAuthor} commented on a session`;
    }
};

const getLink = (notification: any, organization_id: string) => {
    const baseUrl = `/${organization_id}`;

    switch (notification.type as NotificationType) {
        case NotificationType.ErrorComment:
            return `${baseUrl}/errors/${notification.error_id}`;
        default:
            return `/`;
        case NotificationType.SessionComment:
            return `${baseUrl}/sessions/${notification.session_id}?${PlayerSearchParameters.commentId}=${notification.id}`;
    }
};

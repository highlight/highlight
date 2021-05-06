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
                <h3 className={notificationStyles.title}>
                    {getTitle(notification)}
                </h3>
                <span className={notificationStyles.timestamp}>
                    {moment(notification?.updated_at).fromNow()}
                </span>
                <CommentTextBody commentText={notification?.text || ''} />
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

const getTitle = (notification: any): React.ReactNode => {
    const notificationAuthor =
        notification?.author.name || notification?.author.email;
    let suffix = 'mentioned you';

    switch (notification.type as NotificationType) {
        case NotificationType.ErrorComment:
            suffix = 'mentioned you';
            break;
        case NotificationType.SessionComment:
            suffix = 'mentioned you';
            break;
    }

    return (
        <>
            {notificationAuthor}{' '}
            <span className={notificationStyles.titleSuffix}>{suffix}</span>
        </>
    );
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

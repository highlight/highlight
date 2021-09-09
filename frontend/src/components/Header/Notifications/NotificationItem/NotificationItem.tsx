import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import SvgQuoteIcon from '@icons/QuoteIcon';
import { useParams } from '@util/react-router/useParams';
import React from 'react';
import { Link } from 'react-router-dom';

import { PlayerSearchParameters } from '../../../../pages/Player/PlayerHook/utils';
import CommentTextBody from '../../../../pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody';
import SvgBugIcon from '../../../../static/BugIcon';
import SvgMessageIcon from '../../../../static/MessageIcon';
import { AdminAvatar } from '../../../Avatar/Avatar';
import Dot from '../../../Dot/Dot';
import RelativeTime from '../../../RelativeTime/RelativeTime';
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
    const organizationIdRemapped =
        organization_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : organization_id;

    return (
        <Link
            className={notificationStyles.notification}
            to={getLink(notification, organizationIdRemapped)}
            onClick={onViewHandler}
        >
            <div className={notificationStyles.notificationStartColumn}>
                <div className={notificationStyles.notificationIconContainer}>
                    {getIcon(notification.type)}
                </div>

                <AdminAvatar adminInfo={notification.author} size={30} />
            </div>
            <div className={notificationStyles.notificationBody}>
                <h3 className={notificationStyles.title}>
                    {getTitle(notification)}
                </h3>
                <p className={notificationStyles.timestamp}>
                    <RelativeTime datetime={notification?.updated_at} />
                </p>
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
            return <SvgBugIcon />;
        case NotificationType.SessionComment:
            return <SvgMessageIcon />;
        case NotificationType.SessionFeedback:
            return <SvgQuoteIcon />;
    }
};

const getTitle = (notification: any): React.ReactNode => {
    const notificationAuthor =
        notification?.author.name || notification?.author.email;
    let suffix = 'commented';

    switch (notification.type as NotificationType) {
        case NotificationType.ErrorComment:
            suffix = 'commented on an error';
            break;
        case NotificationType.SessionComment:
            suffix = 'commented on a session';
            break;
        case NotificationType.SessionFeedback:
            suffix = 'left feedback';
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
        case NotificationType.SessionComment:
            return `${baseUrl}/sessions/${notification.session_id}?${PlayerSearchParameters.commentId}=${notification.id}&${PlayerSearchParameters.ts}=${notification.timestamp}`;
        case NotificationType.SessionFeedback:
            return `${baseUrl}/sessions/${notification.session_id}?${PlayerSearchParameters.commentId}=${notification.id}`;
        default:
            return `/`;
    }
};

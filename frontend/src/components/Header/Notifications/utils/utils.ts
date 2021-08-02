import { GetNotificationsQuery } from '../../../../graph/generated/operations';

export enum NotificationType {
    ErrorComment,
    SessionComment,
}

export const processNotifications = ({
    error_comments_for_organization,
    session_comments_for_organization,
}: GetNotificationsQuery) => {
    const errorCommentNotifications = error_comments_for_organization.map(
        (errorComment) => ({
            ...errorComment,
            type: NotificationType.ErrorComment,
        })
    );
    const sessionCommentNotifications = session_comments_for_organization.map(
        (sessionComment) => ({
            ...sessionComment,
            type: NotificationType.SessionComment,
        })
    );
    const allNotifications: any[] = [
        ...errorCommentNotifications,
        ...sessionCommentNotifications,
    ];

    const sortedNotificationsDescending = allNotifications.sort((a, b) => {
        return (
            new Date(b?.updated_at || 0).getTime() -
            new Date(a?.updated_at || 0).getTime()
        );
    });

    return sortedNotificationsDescending;
};

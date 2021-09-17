import { useAuthContext } from '@authentication/AuthContext';
import { GetAdminsQuery } from '@graph/operations';
import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';
import { SuggestionDataItem } from 'react-mentions';

import {
    Admin,
    SanitizedAdminInput,
    SessionCommentType,
} from '../../graph/generated/schemas';
import { AdminAvatar, Avatar } from '../Avatar/Avatar';
import DotsMenu from '../DotsMenu/DotsMenu';
import RelativeTime from '../RelativeTime/RelativeTime';
import styles from './CommentHeader.module.scss';

export interface AdminSuggestion extends SuggestionDataItem {
    email?: string;
    photoUrl?: string | null;
    name?: string;
}

export const parseAdminSuggestions = (
    /** A list of all admins in the organization. */
    data: GetAdminsQuery | undefined,
    /** The current logged in admin. */
    currentAdmin: Admin | undefined,
    /** A list of admins that have already been mentioned. */
    mentionedAdmins: SanitizedAdminInput[]
): AdminSuggestion[] => {
    if (!data?.admins || !currentAdmin) {
        return [];
    }

    return (
        data.admins
            // Filter out these admins
            .filter(
                (admin) =>
                    // 1. The admin that is creating the comment
                    admin!.email !== currentAdmin!.email &&
                    // 2. Admins that are already mentioned
                    !mentionedAdmins.some(
                        (mentionedAdmin) => mentionedAdmin.id === admin?.id
                    )
            )
            .map((admin) => {
                return {
                    id: admin!.id,
                    email: admin!.email,
                    photo_url: admin!.photo_url,
                    display: admin?.name || admin!.email,
                    name: admin?.name,
                };
            })
    );
};

export const CommentHeader = ({
    comment,
    menu,
    children,
    footer,
}: PropsWithChildren<{
    comment: any;
    menu: JSX.Element;
    footer?: React.ReactNode;
}>) => {
    const { isLoggedIn } = useAuthContext();

    return (
        <>
            <div className={classNames(styles.commentHeader)}>
                {comment?.type === SessionCommentType.Feedback ? (
                    <Avatar
                        seed={
                            comment?.metadata?.name ||
                            comment?.metadata?.email ||
                            'Anonymous'
                        }
                        style={{ height: 30, width: 30 }}
                    />
                ) : (
                    <AdminAvatar adminInfo={comment.author} size={30} />
                )}
                <div className={styles.textContainer}>
                    <p className={styles.commentAuthor}>
                        {comment?.type === SessionCommentType.Feedback
                            ? comment?.metadata?.name ||
                              comment?.metadata?.email?.split('@')[0] ||
                              'Anonymous'
                            : comment.author.name ||
                              comment.author.email.split('@')[0]}
                    </p>
                    <span className={styles.commentUpdatedTime}>
                        <RelativeTime datetime={comment.updated_at} />
                    </span>
                </div>
                <span className={styles.endActions}>
                    {isLoggedIn && (
                        <DotsMenu menu={menu} trackingId="CommentsHeader" />
                    )}
                </span>
                <div className={styles.childrenContainer}>{children}</div>
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </>
    );
};

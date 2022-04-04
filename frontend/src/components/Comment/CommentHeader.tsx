import { useAuthContext } from '@authentication/AuthContext';
import CloseButton from '@components/CloseButton/CloseButton';
import { Admin, SanitizedAdminInput, SessionCommentType } from '@graph/schemas';
import SvgShare2Icon from '@icons/Share2Icon';
import { CommentSuggestion } from '@util/comment/util';
import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';
import { SuggestionDataItem } from 'react-mentions';

import { AdminAvatar, Avatar } from '../Avatar/Avatar';
import DotsMenu from '../DotsMenu/DotsMenu';
import RelativeTime from '../RelativeTime/RelativeTime';
import styles from './CommentHeader.module.scss';

export interface AdminSuggestion extends SuggestionDataItem {
    email?: string;
    photoUrl?: string;
    name?: string;
}

export const parseAdminSuggestions = (
    /** A list of all admins in the project. */
    suggestions: CommentSuggestion[],
    /** The current logged in admin. */
    currentAdmin: Admin | undefined,
    /** A list of admins that have already been mentioned. */
    mentionedAdmins: SanitizedAdminInput[]
): AdminSuggestion[] => {
    if (!currentAdmin) {
        return [];
    }

    return (
        suggestions
            // Filter out these admins
            .filter(
                (suggestion) =>
                    // 1. The admin that is creating the comment
                    suggestion?.email !== currentAdmin.email &&
                    // 2. Admins that are already mentioned
                    !mentionedAdmins.some(
                        (mentionedAdmin) => mentionedAdmin.id === suggestion?.id
                    )
            )
            .map((suggestion) => {
                return {
                    id: suggestion!.id,
                    email: suggestion!.email,
                    photo_url: suggestion!.photoUrl,
                    display: suggestion?.name || suggestion!.email || '',
                    name: suggestion?.name,
                };
            })
    );
};

export const CommentHeader = ({
    comment,
    moreMenu,
    children,
    footer,
    shareMenu,
    onClose,
}: PropsWithChildren<{
    comment: any;
    moreMenu?: JSX.Element;
    shareMenu?: JSX.Element;
    onClose?: () => void;
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
                        <>
                            {shareMenu && (
                                <DotsMenu
                                    menu={shareMenu}
                                    trackingId="CommentsShare"
                                    icon={<SvgShare2Icon />}
                                />
                            )}
                            {moreMenu && (
                                <DotsMenu
                                    menu={moreMenu}
                                    trackingId="CommentsHeader"
                                />
                            )}
                            {onClose && (
                                <CloseButton
                                    onClick={onClose}
                                    trackingId={'CommentsClose'}
                                />
                            )}
                        </>
                    )}
                </span>
                <div className={styles.childrenContainer}>{children}</div>
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </>
    );
};

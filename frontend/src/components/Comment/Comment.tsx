import { Dropdown } from 'antd';
import React from 'react';
import { SuggestionDataItem } from 'react-mentions';
import {
    GetAdminQuery,
    GetAdminsQuery,
} from '../../graph/generated/operations';
import styles from './Comment.module.scss';
import classNames from 'classnames';
import moment from 'moment';
import { HiDotsHorizontal } from 'react-icons/hi';
import { AdminAvatar } from '../Avatar/Avatar';
import { SanitizedAdminInput } from '../../graph/generated/schemas';

export interface AdminSuggestion extends SuggestionDataItem {
    email?: string;
    photo_url?: string | null;
    name?: string;
}

export const parseAdminSuggestions = (
    data: GetAdminsQuery | undefined,
    admin_data: GetAdminQuery | undefined,
    mentionedAdmins: SanitizedAdminInput[]
): AdminSuggestion[] => {
    if (!data?.admins || !admin_data?.admin) {
        return [];
    }

    return (
        data.admins
            // Filter out these admins
            .filter(
                (admin) =>
                    // 1. The admin that is creating the comment
                    admin!.email !== admin_data.admin!.email &&
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
}: {
    comment: any;
    menu: JSX.Element;
}) => {
    return (
        <div className={classNames(styles.commentHeader)}>
            <AdminAvatar adminInfo={comment.author} size={25} />
            <span className={styles.commentAuthor}>
                {comment.author.name || comment.author.email.split('@')[0]}
            </span>
            <span className={styles.commentUpdatedTime}>
                {moment(comment.updated_at).fromNow()}
            </span>
            <span className={styles.endActions}>
                <Dropdown
                    overlay={menu}
                    placement="bottomLeft"
                    trigger={['click']}
                >
                    <button className={styles.ellipsisButton}>
                        <HiDotsHorizontal />
                    </button>
                </Dropdown>
            </span>
        </div>
    );
};

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

export interface AdminSuggestion extends SuggestionDataItem {
    email?: string;
    photo_url?: string | null;
    name?: string;
}

export const parseAdminSuggestions = (
    data: GetAdminsQuery | undefined,
    admin_data: GetAdminQuery | undefined,
    mentionedAdmins: any
): AdminSuggestion[] => {
    if (!data?.admins || !admin_data?.admin) {
        return [];
    }

    return data.admins
        .filter(
            (admin) =>
                admin!.email !== admin_data.admin!.email &&
                !mentionedAdmins.includes(admin!.email)
        )
        .map((admin) => {
            return {
                id: admin!.email,
                email: admin!.email,
                photo_url: admin!.photo_url,
                display: admin?.name || admin!.email,
                name: admin?.name,
            };
        });
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

import { Maybe } from 'graphql/jsutils/Maybe';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import {
    SessionComment,
    SanitizedAdmin,
} from '../../../../graph/generated/schemas';
import CommentTextBody from '../../../../pages/Player/Toolbar/NewCommentEntry/CommentTextBody/CommentTextBody';
import SvgMessageIcon from '../../../../static/MessageIcon';
import notificationStyles from '../Notification.module.scss';

interface Props {
    comment: Maybe<
        { __typename?: 'SessionComment' } & Pick<
            SessionComment,
            'id' | 'timestamp' | 'updated_at' | 'text'
        > & {
                author: { __typename?: 'SanitizedAdmin' } & Pick<
                    SanitizedAdmin,
                    'id' | 'name' | 'email'
                >;
            }
    >;
}

const CommentNotification = ({ comment }: Props) => {
    return (
        <Link className={notificationStyles.notification} to={`/`}>
            <div className={notificationStyles.notificationIconContainer}>
                <SvgMessageIcon />
            </div>
            <div className={notificationStyles.notificationBody}>
                <h3>
                    {comment?.author.name || comment?.author.email} commented on
                    a session
                </h3>
                <CommentTextBody commentText={`"${comment?.text || ''}"`} />
                {moment(comment?.updated_at).fromNow()}
            </div>
        </Link>
    );
};

export default CommentNotification;

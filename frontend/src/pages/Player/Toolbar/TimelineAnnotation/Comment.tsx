import classNames from 'classnames';
import moment from 'moment';
import React from 'react';
import { ParsedSessionComment } from '../../ReplayerContext';
import styles from '../Toolbar.module.scss';

interface Props {
    comment: ParsedSessionComment;
}

const Comment = ({ comment }: Props) => {
    return (
        <div className={classNames(styles.commentHeader)}>
            <span className={styles.commentAuthor}>
                {comment.author.name || comment.author.email}
            </span>
            <span className={styles.commentUpdatedTime}>
                {moment(comment.updated_at).fromNow()}
            </span>
        </div>
    );
};

export default Comment;

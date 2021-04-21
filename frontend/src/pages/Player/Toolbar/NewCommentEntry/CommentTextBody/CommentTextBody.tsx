import React from 'react';
import styles from './CommentTextBody.module.scss';
import classNames from './CommentTextBody.module.css';
import {
    MentionsInput,
    Mention,
    OnChangeHandlerFunc,
    SuggestionDataItem,
} from 'react-mentions';

interface Props {
    commentText: string;
    placeholder?: string;
    onChangeHandler?: OnChangeHandlerFunc;
    suggestions?: SuggestionDataItem[];
    onDisplayTransformHandler?: (_id: string, display: string) => string;
}

const CommentTextBody = ({
    commentText,
    placeholder,
    onChangeHandler,
    suggestions = [],
    onDisplayTransformHandler,
}: Props) => {
    return (
        <MentionsInput
            value={commentText}
            className="mentions"
            classNames={classNames}
            onChange={onChangeHandler}
            placeholder={placeholder}
            autoFocus
            disabled={!onChangeHandler}
        >
            <Mention
                className={styles.mention}
                trigger="@"
                data={suggestions}
                displayTransform={onDisplayTransformHandler}
                appendSpaceOnAdd
                markup="{{{[__display__](__id__)}}}"
            />
        </MentionsInput>
    );
};

export default CommentTextBody;

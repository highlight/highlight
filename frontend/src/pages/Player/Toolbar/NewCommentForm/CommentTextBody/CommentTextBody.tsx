import classNames from 'classnames';
import React, { useEffect } from 'react';
import { Mention, MentionsInput, OnChangeHandlerFunc } from 'react-mentions';

import { AdminAvatar } from '../../../../../components/Avatar/Avatar';
import { AdminSuggestion } from '../../../../../components/Comment/CommentHeader';
import newCommentFormStyles from '../NewCommentForm.module.scss';
import commentTextBodyClassNames from './CommentTextBody.module.css';
import styles from './CommentTextBody.module.scss';

interface Props {
    commentText: string;
    placeholder?: string;
    onChangeHandler?: OnChangeHandlerFunc;
    suggestions?: AdminSuggestion[];
    onDisplayTransformHandler?: (_id: string, display: string) => string;
    suggestionsPortalHost?: Element;
}

const CommentTextBody = ({
    commentText,
    placeholder,
    onChangeHandler,
    suggestions = [],
    onDisplayTransformHandler,
    suggestionsPortalHost,
}: Props) => {
    useEffect(() => {
        const textarea = document.querySelector(
            `.${newCommentFormStyles.commentInputContainer} textarea`
        ) as HTMLTextAreaElement | null;
        if (textarea) {
            textarea.focus();
        }
    });

    return (
        <MentionsInput
            value={commentText}
            className="mentions"
            classNames={commentTextBodyClassNames}
            onChange={onChangeHandler}
            placeholder={placeholder}
            autoFocus
            disabled={!onChangeHandler}
            suggestionsPortalHost={suggestionsPortalHost}
            allowSuggestionsAboveCursor
        >
            <Mention
                className={commentTextBodyClassNames.mentions__mention}
                trigger="@"
                data={suggestions}
                displayTransform={onDisplayTransformHandler}
                appendSpaceOnAdd
                renderSuggestion={(
                    suggestion,
                    search,
                    highlightedDisplay,
                    index,
                    focused
                ) => (
                    <Suggestion
                        focused={focused}
                        highlightedDisplay={highlightedDisplay}
                        index={index}
                        search={search}
                        suggestion={suggestion as AdminSuggestion}
                    />
                )}
            />
        </MentionsInput>
    );
};

export default CommentTextBody;

const Suggestion = ({
    suggestion,
}: {
    suggestion: AdminSuggestion;
    search: string;
    highlightedDisplay: React.ReactNode;
    index: number;
    focused: boolean;
}) => {
    return (
        <div className={styles.suggestionContainer}>
            <AdminAvatar
                adminInfo={{
                    name: suggestion.name,
                    email: suggestion.email,
                    photo_url: suggestion.photoUrl,
                }}
                size={35}
            />
            <div className={styles.adminText}>
                <span className={styles.longValue}>{suggestion.display}</span>
                {suggestion.display !== suggestion.id && (
                    <span
                        className={classNames(styles.email, styles.longValue)}
                    >
                        {suggestion.email}
                    </span>
                )}
            </div>
        </div>
    );
};

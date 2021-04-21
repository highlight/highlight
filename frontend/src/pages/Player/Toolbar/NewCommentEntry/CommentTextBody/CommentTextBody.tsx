import React from 'react';
import styles from './CommentTextBody.module.scss';
import commentTextBodyClassNames from './CommentTextBody.module.css';
import {
    MentionsInput,
    Mention,
    OnChangeHandlerFunc,
    SuggestionDataItem,
} from 'react-mentions';
import { Avatar } from '../../../../../components/Avatar/Avatar';
import classNames from 'classnames';

interface Props {
    commentText: string;
    placeholder?: string;
    onChangeHandler?: OnChangeHandlerFunc;
    suggestions?: SuggestionDataItem[];
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
        >
            <Mention
                className={styles.mention}
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
                        suggestion={suggestion}
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
    suggestion: SuggestionDataItem;
    search: string;
    highlightedDisplay: React.ReactNode;
    index: number;
    focused: boolean;
}) => {
    return (
        <div className={styles.suggestionContainer}>
            <Avatar
                seed={suggestion.id.toString()}
                style={{ height: 'var(--size-xxLarge)' }}
            />
            <div className={styles.adminText}>
                <span className={styles.longValue}>{suggestion.display}</span>
                {suggestion.display !== suggestion.id && (
                    <span
                        className={classNames(styles.email, styles.longValue)}
                    >
                        {suggestion.id}
                    </span>
                )}
            </div>
        </div>
    );
};

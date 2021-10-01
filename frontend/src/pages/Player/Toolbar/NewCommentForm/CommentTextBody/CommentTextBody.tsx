import { getSlackUrl } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import SvgSlackLogo from '@components/icons/SlackLogo';
import {
    Mention,
    MentionsInput,
    OnChangeHandlerFunc,
} from '@highlight-run/react-mentions';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

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
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const slackUrl = getSlackUrl('Organization', project_id, 'alerts');

    useEffect(() => {
        const textarea = document.querySelector(
            `.${newCommentFormStyles.commentInputContainer} textarea`
        ) as HTMLTextAreaElement | null;
        if (textarea) {
            textarea.focus();
        }
    });

    const isSlackIntegrated = suggestions.some(
        (suggestion) =>
            suggestion.display?.includes('#') ||
            (suggestion.display && suggestion.display[0] == '@')
    );

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
            listHeader={
                <div className={styles.suggestionHeader}>
                    {isSlackIntegrated ? (
                        <p>Tag a user or Slack account</p>
                    ) : (
                        <p>
                            Tag a user (Enable Slack tags{' '}
                            <Link to={`/${project_id}/alerts`}>here</Link>)
                        </p>
                    )}
                </div>
            }
            noResultsMessage={
                <>
                    <p className={styles.noResultsMessage}>
                        Can't find the channel or person here?{' '}
                        <a href={slackUrl}>
                            Sync Highlight with your Slack Workspace
                        </a>
                        .
                    </p>
                </>
            }
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
            <div className={styles.avatarContainer}>
                {['@', '#'].includes((suggestion?.name || '')[0]) && (
                    <div className={styles.slackLogoContainer}>
                        <SvgSlackLogo className={styles.slackLogo} />
                    </div>
                )}
                <AdminAvatar
                    adminInfo={{
                        name: suggestion.name,
                        email: suggestion.email,
                        photo_url: suggestion.photoUrl,
                    }}
                    size={35}
                />
            </div>
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

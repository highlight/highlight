import { AdminAvatar } from '@components/Avatar/Avatar';
import { AdminSuggestion } from '@components/Comment/CommentHeader';
import { getSlackUrl } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import SvgSlackLogo from '@components/icons/SlackLogo';
import { namedOperations } from '@graph/operations';
import {
    Mention,
    MentionsInput,
    OnChangeHandlerFunc,
} from '@highlight-run/react-mentions';
import SyncWithSlackButton from '@pages/Alerts/AlertConfigurationCard/SyncWithSlackButton';
import { useParams } from '@util/react-router/useParams';
import { splitTaggedUsers } from '@util/string';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import Linkify from 'react-linkify';

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

    newInput?: boolean;
}

const CommentTextBody = ({
    commentText,
    placeholder,
    onChangeHandler,
    suggestions = [],
    onDisplayTransformHandler,
    suggestionsPortalHost,

    newInput,
}: Props) => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const slackUrl = getSlackUrl('Organization', project_id);
    const [shouldAutoFocus, setShouldAutoFocus] = useState(!!onChangeHandler);

    useEffect(() => {
        if (shouldAutoFocus) {
            const textarea = document.querySelector(
                `.${newCommentFormStyles.commentInputContainer} textarea`
            ) as HTMLTextAreaElement | null;
            if (textarea) {
                textarea.focus();
            }
            setShouldAutoFocus(false);
        }
    }, [shouldAutoFocus]);

    const isSlackIntegrated = suggestions.some(
        (suggestion) =>
            suggestion.display?.includes('#') ||
            (suggestion.display && suggestion.display[0] == '@')
    );

    if (!newInput) {
        const pieces = [];
        for (const { matched, value } of splitTaggedUsers(commentText)) {
            if (matched) {
                pieces.push(
                    <span className={commentTextBodyClassNames.mentionedUser}>
                        {value}
                    </span>
                );
            } else {
                pieces.push(
                    <span className={commentTextBodyClassNames.commentText}>
                        <Linkify
                            componentDecorator={(
                                decoratedHref: string,
                                decoratedText: string,
                                key: number
                            ) => (
                                <a
                                    target={'_blank'}
                                    rel="noreferrer"
                                    href={decoratedHref}
                                    key={key}
                                >
                                    {decoratedText}
                                </a>
                            )}
                        >
                            {value}
                        </Linkify>
                    </span>
                );
            }
        }
        return <>{pieces}</>;
    }

    return (
        <MentionsInput
            value={commentText}
            className="mentions"
            classNames={commentTextBodyClassNames}
            onChange={onChangeHandler}
            placeholder={placeholder}
            autoFocus={shouldAutoFocus}
            aria-readonly={!onChangeHandler}
            suggestionsPortalHost={suggestionsPortalHost}
            allowSuggestionsAboveCursor
            listHeader={
                <div className={styles.suggestionHeader}>
                    {isSlackIntegrated ? (
                        <>
                            <p>Tag a user or Slack account</p>
                            <SyncWithSlackButton
                                isSlackIntegrated={isSlackIntegrated}
                                slackUrl={slackUrl}
                                small
                                refetchQueries={[
                                    namedOperations.Query
                                        .GetCommentMentionSuggestions,
                                ]}
                            />
                        </>
                    ) : (
                        <p>
                            Tag a user (
                            <a href={slackUrl}>Enable Slack Mentions</a>)
                        </p>
                    )}
                </div>
            }
            noResultsMessage={
                <>
                    <p className={styles.noResultsMessage}>
                        <SyncWithSlackButton
                            isSlackIntegrated={isSlackIntegrated}
                            slackUrl={slackUrl}
                            refetchQueries={[
                                namedOperations.Query
                                    .GetCommentMentionSuggestions,
                            ]}
                        />
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

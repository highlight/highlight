import { GetCommentMentionSuggestionsQuery } from '@graph/operations';
import { SessionCommentType } from '@graph/schemas';
import { ParsedSessionComment } from '@pages/Player/ReplayerContext';

export const getFeedbackCommentSessionTimestamp = (
    comment: ParsedSessionComment,
    sessionStartTime: number
) => {
    if (comment.type !== SessionCommentType.Feedback) {
        console.error('This comment is not the correct type.');
        return 0;
    }

    const commentCreatedAt = new Date(comment.metadata.timestamp);

    const dateTimeSessionStart = new Date(sessionStartTime);
    const deltaMilliseconds =
        commentCreatedAt.getTime() - dateTimeSessionStart.getTime();

    return deltaMilliseconds;
};

export interface CommentSuggestion {
    id: string;
    name: string;
    email?: string;
    photoUrl: string;
}

export const getCommentMentionSuggestions = (
    suggestions: GetCommentMentionSuggestionsQuery | undefined
): CommentSuggestion[] => {
    if (!suggestions) {
        return [];
    }
    const mappedAdmins: CommentSuggestion[] = suggestions.admins.map(
        (admin) => ({
            id: admin!.id,
            email: admin!.email,
            name: admin?.name || '',
            photoUrl: admin!.photo_url as string,
        })
    );

    if (suggestions.slack_members.length === 0) {
        return mappedAdmins;
    }

    return [
        ...mappedAdmins,
        ...suggestions.slack_members.map<CommentSuggestion>((slackMember) => ({
            id: slackMember!.webhook_channel_id as string,
            name: slackMember!.webhook_channel as string,
            photoUrl: '',
        })),
    ];
};

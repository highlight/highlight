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

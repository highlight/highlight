import classNames from 'classnames';
import React, { useContext, useEffect, useRef, useState } from 'react';
import playerStyles from '../PlayerPage.module.scss';
import ReplayerContext from '../ReplayerContext';
import styles from './CommentButton.module.scss';
import { useGetSessionCommentsQuery } from '../../../graph/generated/hooks';
import { useParams } from 'react-router-dom';
import Comment from './Comment/Comment';
import CommentPinIcon from '../../../static/comment-pin.png';
import useLocalStorage from '@rehooks/local-storage';
import { EventsForTimeline, PlayerSearchParameters } from '../PlayerHook/utils';

export interface Coordinates2D {
    x: number;
    y: number;
}
interface Props {
    setModalPosition: React.Dispatch<
        React.SetStateAction<Coordinates2D | undefined>
    >;
    isReplayerReady: boolean;
    modalPosition: Coordinates2D | undefined;
    setCommentPosition: React.Dispatch<
        React.SetStateAction<Coordinates2D | undefined>
    >;
}

const CommentButton = ({
    setModalPosition,
    isReplayerReady,
    modalPosition,
    setCommentPosition,
}: Props) => {
    const { session_id } = useParams<{ session_id: string }>();
    const { data: sessionCommentsData } = useGetSessionCommentsQuery({
        variables: {
            session_id: session_id,
        },
    });
    const deepLinkedCommentId = new URLSearchParams(location.search).get(
        PlayerSearchParameters.commentId
    );
    const [
        enabledTimelineAnnotation,
    ] = useLocalStorage('highlightTimelineAnnotationTypes', [
        ...EventsForTimeline,
    ]);
    const { pause, replayer, time } = useContext(ReplayerContext);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [indicatorLocation, setIndicatorLocation] = useState<
        Coordinates2D | undefined
    >(undefined);
    const [enableDOMInteractions] = useLocalStorage(
        'highlightMenuEnableDOMInteractions',
        false
    );
    const playerBoundingClientRectWidth = replayer?.wrapper?.getBoundingClientRect()
        .width;
    const playerBoundingClientRectHeight = replayer?.wrapper?.getBoundingClientRect()
        .height;

    // Set size of the button to be the same as the replayer. This allows us to intercept any clicks on replayer.
    useEffect(() => {
        if (!playerBoundingClientRectHeight || !playerBoundingClientRectWidth) {
            return;
        }

        if (buttonRef.current) {
            buttonRef.current.style.width = `${playerBoundingClientRectWidth}px`;
            buttonRef.current.style.height = `${playerBoundingClientRectHeight}px`;
        }
    }, [playerBoundingClientRectHeight, playerBoundingClientRectWidth]);

    // Hide the indicator if there is no comment being created.
    useEffect(() => {
        if (!modalPosition) {
            setIndicatorLocation(undefined);
            setCommentPosition(undefined);
        }
    }, [modalPosition, setCommentPosition]);

    const showCommentsOverlaid = enabledTimelineAnnotation.includes('Comments');

    if (enableDOMInteractions) {
        return null;
    }

    return (
        <>
            <button
                style={{
                    visibility: isReplayerReady ? 'visible' : 'hidden',
                }}
                className={classNames(playerStyles.rrwebPlayerDiv, {
                    [styles.commentButton]: isReplayerReady,
                })}
                onClick={(e) => {
                    if (buttonRef?.current) {
                        const rect = buttonRef.current.getBoundingClientRect();

                        // Calculate the position of where the user clicked relative to the session player.
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        // Calculate relative percentage. We will store this and use it to position overlaid comments. We store the relative percentage instead of the absolute value to account for different users viewing the session at different scales/sizes.
                        const xPercentage = x / rect.width;
                        const yPercentage = y / rect.height;

                        const xOffset = 24;
                        let yOffset = -36;

                        if (yPercentage > 0.9) {
                            yOffset -= 100;
                        }
                        setModalPosition({
                            x: e.pageX + xOffset,
                            y: e.pageY + yOffset,
                        });
                        setIndicatorLocation({ x, y });
                        setCommentPosition({ x: xPercentage, y: yPercentage });

                        pause();
                    }
                }}
                ref={buttonRef}
            >
                {indicatorLocation && (
                    <img
                        className={styles.commentIndicator}
                        style={{
                            left: `calc(${indicatorLocation.x}px - (var(--comment-indicator-width) / 2))`,
                            top: `calc(${indicatorLocation.y}px - var(--comment-indicator-height) + 2px)`,
                        }}
                        src={CommentPinIcon}
                    />
                )}
                {sessionCommentsData?.session_comments.map(
                    (comment) =>
                        comment &&
                        showCommentsOverlaid && (
                            <Comment
                                key={comment.id}
                                comment={comment}
                                deepLinkedCommentId={deepLinkedCommentId}
                                shouldShowComment={
                                    // Show the comment if the comment was made within 3 seconds of the current time.
                                    Math.abs(time - comment.timestamp) <= 3000
                                }
                            />
                        )
                )}
            </button>
        </>
    );
};

export default CommentButton;

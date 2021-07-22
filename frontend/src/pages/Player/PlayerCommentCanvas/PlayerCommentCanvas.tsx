import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGetSessionCommentsQuery } from '../../../graph/generated/hooks';
import CommentPinIcon from '../../../static/comment-pin.png';
import { PlayerSearchParameters } from '../PlayerHook/utils';
import usePlayerConfiguration from '../PlayerHook/utils/usePlayerConfiguration';
import playerStyles from '../PlayerPage.module.scss';
import { useReplayerContext } from '../ReplayerContext';
import styles from './PlayerCommentCanvas.module.scss';
import PlayerSessionComment from './PlayerSessionComment/PlayerSessionComment';

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

const PlayerCommentCanvas = ({
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
    const {
        selectedTimelineAnnotationTypes,
        setSelectedTimelineAnnotationTypes,
        enableInspectElement,
    } = usePlayerConfiguration();
    const [deepLinkedCommentId, setDeepLinkedCommentId] = useState(
        new URLSearchParams(location.search).get(
            PlayerSearchParameters.commentId
        )
    );
    const { pause, replayer } = useReplayerContext();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [indicatorLocation, setIndicatorLocation] = useState<
        Coordinates2D | undefined
    >(undefined);
    const playerBoundingClientRectWidth = replayer?.wrapper?.getBoundingClientRect()
        .width;
    const playerBoundingClientRectHeight = replayer?.wrapper?.getBoundingClientRect()
        .height;

    useEffect(() => {
        const commentId = new URLSearchParams(location.search).get(
            PlayerSearchParameters.commentId
        );

        if (commentId) {
            setDeepLinkedCommentId(commentId);
            // Show comments on the timeline indicators if deep linked.
            if (!selectedTimelineAnnotationTypes.includes('Comments')) {
                setSelectedTimelineAnnotationTypes([
                    ...selectedTimelineAnnotationTypes,
                    'Comments',
                ]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

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

    const showCommentsOverlaid = selectedTimelineAnnotationTypes.includes(
        'Comments'
    );

    if (enableInspectElement) {
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
                            <PlayerSessionComment
                                key={comment.id}
                                comment={comment}
                                deepLinkedCommentId={deepLinkedCommentId}
                            />
                        )
                )}
            </button>
        </>
    );
};

export default PlayerCommentCanvas;

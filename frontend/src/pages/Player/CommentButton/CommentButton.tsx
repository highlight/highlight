import classNames from 'classnames';
import React, { useContext, useEffect, useRef, useState } from 'react';
import playerStyles from '../PlayerPage.module.scss';
import ReplayerContext from '../ReplayerContext';
import styles from './CommentButton.module.scss';
import CommentPinIcon from '../../../static/comment-pin.png';

interface CommentClickLocation {
    x: number;
    y: number;
}
interface Props {
    setCommentClickLocation: React.Dispatch<
        React.SetStateAction<CommentClickLocation | undefined>
    >;
    isReplayerReady: boolean;
    clickLocation: CommentClickLocation | undefined;
}

const CommentButton = ({
    setCommentClickLocation,
    isReplayerReady,
    clickLocation,
}: Props) => {
    const { pause, scale, replayer } = useContext(ReplayerContext);
    const ref = useRef<HTMLButtonElement>(null);
    const [indicatorLocation, setIndicatorLocation] = useState<
        CommentClickLocation | undefined
    >(undefined);

    // Set size of the button to be the same as the replayer. This allows us to intercept any clicks on replayer.
    useEffect(() => {
        const width = replayer?.wrapper?.getBoundingClientRect().width;
        const height = replayer?.wrapper?.getBoundingClientRect().height;

        if (!width || !height) {
            return;
        }
        if (ref.current) {
            ref.current.style.width = `${width}px`;
            ref.current.style.height = `${height}px`;
        }
    }, [replayer?.wrapper, scale]);

    // Hide the indicator if there is no comment being created.
    useEffect(() => {
        if (!clickLocation) {
            setIndicatorLocation(undefined);
        }
    }, [clickLocation]);

    return (
        <button
            style={{
                visibility: isReplayerReady ? 'visible' : 'hidden',
            }}
            className={classNames(playerStyles.rrwebPlayerDiv, {
                [styles.commentButton]: isReplayerReady,
            })}
            onClick={(e) => {
                if (ref?.current) {
                    const rect = ref.current.getBoundingClientRect();

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
                    setCommentClickLocation({
                        x: e.pageX + xOffset,
                        y: e.pageY + yOffset,
                    });
                    setIndicatorLocation({ x, y });

                    pause();
                }
            }}
            ref={ref}
        >
            {indicatorLocation && (
                <img
                    className={styles.commentIndicator}
                    style={{
                        // Offset the position so the center of the pin is positioned where the user clicked.
                        left: `calc(${indicatorLocation.x}px - (var(--comment-indicator-width) / 2))`,
                        top: `calc(${indicatorLocation.y}px - var(--comment-indicator-height) + 2px)`,
                    }}
                    src={CommentPinIcon}
                />
            )}
        </button>
    );
};

export default CommentButton;

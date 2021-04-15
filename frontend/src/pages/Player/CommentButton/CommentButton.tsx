import classNames from 'classnames';
import React, { useContext, useEffect, useRef } from 'react';
import playerStyles from '../PlayerPage.module.scss';
import ReplayerContext from '../ReplayerContext';
import styles from './CommentButton.module.scss';

interface Props {
    setCommentClickLocation: React.Dispatch<
        React.SetStateAction<
            | {
                  x: number;
                  y: number;
              }
            | undefined
        >
    >;
    isReplayerReady: boolean;
}

const CommentButton = ({ setCommentClickLocation, isReplayerReady }: Props) => {
    const { pause, scale, replayer } = useContext(ReplayerContext);
    const ref = useRef<HTMLButtonElement>(null);

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

                    const xOffset = 12;
                    let yOffset = 0;

                    if (yPercentage > 0.9) {
                        yOffset -= 100;
                    }
                    setCommentClickLocation({
                        x: e.pageX + xOffset,
                        y: e.pageY + yOffset,
                    });

                    pause();
                }
            }}
            ref={ref}
        ></button>
    );
};

export default CommentButton;

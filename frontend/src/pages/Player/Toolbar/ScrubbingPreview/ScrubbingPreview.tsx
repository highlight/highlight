import { Replayer } from '@highlight-run/rrweb';
import { useReplayerContext } from '@pages/Player/ReplayerContext';
import React, { useEffect, useState } from 'react';

import styles from './ScrubbingPreview.module.scss';

interface Props {
    time: number;
}

const ScrubbingPreview = React.memo(({ time }: Props) => {
    const [player, setPlayer] = useState<null | Replayer>(null);
    const { events } = useReplayerContext();

    useEffect(() => {
        const playerMountingRoot = document.getElementById(
            'scrubbing-preview'
        ) as HTMLElement;

        const newPlayer = new Replayer(events, {
            root: playerMountingRoot,
            triggerFocus: false,
            mouseTail: false,
        });
        setPlayer(newPlayer);
    }, [events]);

    useEffect(() => {
        if (player) {
            player.pause(parseFloat(time.toPrecision(7)));
        }
    }, [player, time]);

    return (
        <div className={styles.scrubbingPreview}>
            <div id="scrubbing-preview"></div>
        </div>
    );
});

export default ScrubbingPreview;

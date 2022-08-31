import { ToolbarItem } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import useLocalStorage from '@rehooks/local-storage';
import { useState } from 'react';

const LocalStorageKeyPrefix = 'highlightToolbarItem';

const useToolbarItems = () => {
    const [devToolsButton, setDevToolsButton] = useLocalStorage<ToolbarItem>(
        `${LocalStorageKeyPrefix}-devtools`,
        {
            isPinned: true,
        }
    );
    const [timelineAnnotations, setTimelineAnnotations] =
        useLocalStorage<ToolbarItem>(
            `${LocalStorageKeyPrefix}-timeline-annotations`,
            {
                isPinned: false,
            }
        );
    const [playbackSpeedControl, setPlaybackSpeedControl] =
        useLocalStorage<ToolbarItem>(
            `${LocalStorageKeyPrefix}-playback-speed-control`,
            {
                isPinned: false,
            }
        );
    const [showMouseTrail, setShowMouseTrail] = useLocalStorage<ToolbarItem>(
        `${LocalStorageKeyPrefix}-mouse-trail`,
        {
            isPinned: false,
        }
    );
    const [skipInactive, setSkipInactive] = useLocalStorage<ToolbarItem>(
        `${LocalStorageKeyPrefix}-skip-inactive`,
        {
            isPinned: false,
        }
    );
    const [autoPlay, setAutoPlay] = useLocalStorage<ToolbarItem>(
        `${LocalStorageKeyPrefix}-autoplay`,
        {
            isPinned: false,
        }
    );
    const [showPlayerTime, setShowPlayerTime] = useLocalStorage<ToolbarItem>(
        `${LocalStorageKeyPrefix}-playerTime`,
        {
            isPinned: false,
        }
    );

    const [zoomAreaLeft, setZoomAreaLeft] = useState<number>(0);
    const [zoomAreaRight, setZoomAreaRight] = useState<number>(100);

    return {
        devToolsButton,
        setDevToolsButton,
        timelineAnnotations,
        setTimelineAnnotations,
        playbackSpeedControl,
        setPlaybackSpeedControl,
        showMouseTrail,
        setShowMouseTrail,
        skipInactive,
        setSkipInactive,
        autoPlay,
        setAutoPlay,
        showPlayerTime,
        setShowPlayerTime,
        zoomAreaLeft,
        setZoomAreaLeft,
        zoomAreaRight,
        setZoomAreaRight,
    };
};

export default useToolbarItems;

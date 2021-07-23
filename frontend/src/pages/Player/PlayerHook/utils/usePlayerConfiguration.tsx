import useLocalStorage from '@rehooks/local-storage';

import { DevToolTabs } from '../../Toolbar/DevToolsContext/DevToolsContext';
import { EventsForTimeline } from '.';

/**
 * Gets configuration for the Player.
 */
const usePlayerConfiguration = () => {
    const [showLeftPanel, setShowLeftPanel] = useLocalStorage(
        'highlightMenuShowLeftPanel',
        false
    );
    const [showRightPanel, setShowRightPanel] = useLocalStorage(
        'highlightMenuShowRightPanel',
        true
    );
    const [showDevTools, setShowDevTools] = useLocalStorage(
        'highlightMenuOpenDevTools',
        false
    );
    const [autoPlayVideo, setAutoPlayVideo] = useLocalStorage(
        'highlightMenuAutoPlayVideo',
        false
    );
    const [selectedDevToolsTab, setSelectedDevToolsTab] = useLocalStorage(
        'highlightSelectedDevtoolTabs',
        DevToolTabs.Errors
    );
    const [
        selectedTimelineAnnotationTypes,
        setSelectedTimelineAnnotationTypes,
    ] = useLocalStorage('highlightTimelineAnnotationTypes', [
        ...EventsForTimeline,
    ]);
    const [
        selectedTimelineAnnotationTypesUserPersisted,
        setSelectedTimelineAnnotationTypesUserPersisted,
    ] = useLocalStorage('highlightTimelineAnnotationTypesUserPersisted', [
        ...EventsForTimeline,
    ]);
    const [playerTime, setPlayerTime] = useLocalStorage('playerTime', 0);
    const [enableInspectElement, setEnableInspectElement] = useLocalStorage(
        'highlightMenuEnableDOMInteractions',
        false
    );
    const [playerSpeed, setPlayerSpeed] = useLocalStorage(
        'highlightMenuSpeed',
        2
    );
    const [skipInactive, setSkipInactive] = useLocalStorage(
        'highlightMenuSkipInactive',
        true
    );

    return {
        showLeftPanel,
        setShowLeftPanel,
        showRightPanel,
        setShowRightPanel,
        showDevTools,
        setShowDevTools,
        autoPlayVideo,
        setAutoPlayVideo,
        selectedDevToolsTab,
        setSelectedDevToolsTab,
        selectedTimelineAnnotationTypes,
        setSelectedTimelineAnnotationTypes,
        selectedTimelineAnnotationTypesUserPersisted,
        setSelectedTimelineAnnotationTypesUserPersisted,
        playerTime,
        setPlayerTime,
        enableInspectElement,
        setEnableInspectElement,
        playerSpeed,
        setPlayerSpeed,
        skipInactive,
        setSkipInactive,
    };
};

export default usePlayerConfiguration;

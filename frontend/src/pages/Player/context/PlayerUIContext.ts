import { ErrorObject } from '@graph/schemas';
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindow/ResourcePage/ResourcePage';
import React from 'react';
import AsyncSelect from 'react-select/async';

import { createContext } from '../../../util/context/context';
import { SessionSearchOption } from '../../Sessions/SessionsFeedV2/components/SessionSearch/SessionSearch';

interface DetailedPanel {
    resource?: NetworkResource;
    error?: ErrorObject;
}

interface PlayerUIContext {
    searchBarRef: AsyncSelect<SessionSearchOption, true> | undefined;
    setSearchBarRef: React.Dispatch<
        React.SetStateAction<AsyncSelect<SessionSearchOption, true> | undefined>
    >;
    isPlayerFullscreen: boolean;
    setIsPlayerFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
    playerCenterPanelRef: React.RefObject<HTMLDivElement>;
    /** Used to show detailed information. */
    detailedPanel?: DetailedPanel;
    setDetailedPanel: React.Dispatch<
        React.SetStateAction<DetailedPanel | undefined>
    >;
    selectedRightPanelTab: 'Events' | 'Comments' | 'Metadata';
    setSelectedRightPanelTab: (
        newValue: 'Events' | 'Comments' | 'Metadata'
    ) => void;
}

export const [
    usePlayerUIContext,
    PlayerUIContextProvider,
] = createContext<PlayerUIContext>('PlayerUI');

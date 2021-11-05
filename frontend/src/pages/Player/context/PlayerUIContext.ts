import React from 'react';
import AsyncSelect from 'react-select/async';

import { createContext } from '../../../util/context/context';
import { SessionSearchOption } from '../../Sessions/SessionsFeedV2/components/SessionSearch/SessionSearch';

interface DetailedPanelOptions {
    noHeader?: boolean;
    noPadding?: boolean;
}

export interface DetailedPanel {
    title: string | React.ReactNode;
    content: React.ReactNode;
    options?: DetailedPanelOptions;
    /** The ID of the object that is being showed details for. */
    id: string;
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

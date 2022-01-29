import React from 'react';

import { createContext } from '../../../util/context/context';

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
    isQueryBuilder: boolean;
}

export const [
    usePlayerUIContext,
    PlayerUIContextProvider,
] = createContext<PlayerUIContext>('PlayerUI');

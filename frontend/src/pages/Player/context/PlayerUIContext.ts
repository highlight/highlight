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

/**
 * This is used if we need to render a higher surface while the player is in fullscreen.
 * This is meant to be used with `Popover`'s `getPopupContainer` prop.
 * Sets the Popover's mount node as the player center panel.
 * The default is document.body
 * We override here to be able to show the comments when the player is in fullscreen
 * Without this, the new comment modal would be below the fullscreen view.
 */
export const getFullScreenPopoverGetPopupContainer = () => {
    const playerCenterPanel = document.getElementById('playerCenterPanel');

    if (playerCenterPanel) {
        return playerCenterPanel;
    }

    return document.body;
};

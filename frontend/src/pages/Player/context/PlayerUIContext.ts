import React from 'react';
import AsyncSelect from 'react-select/async';

import { createContext } from '../../../util/context/context';
import { SessionSearchOption } from '../../Sessions/SessionsFeedV2/components/SessionSearch/SessionSearch';

interface DetailedPanelOptions {
    noHeader?: boolean;
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
    detailedPanel?: {
        title: string | React.ReactNode;
        content: React.ReactNode;
        options?: DetailedPanelOptions;
    };
    setDetailedPanel: React.Dispatch<
        React.SetStateAction<
            | {
                  title: string | React.ReactNode;
                  content: React.ReactNode;
                  options?: DetailedPanelOptions;
              }
            | undefined
        >
    >;
}

export const [
    usePlayerUIContext,
    PlayerUIContextProvider,
] = createContext<PlayerUIContext>('PlayerUI');

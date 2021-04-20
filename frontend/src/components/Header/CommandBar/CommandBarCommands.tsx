import useLocalStorage from '@rehooks/local-storage';
import { History } from 'history';
import { Command } from 'react-command-palette';
import { EventsForTimeline } from '../../../pages/Player/PlayerHook/utils';
import { DevToolTabs } from '../../../pages/Player/Toolbar/DevToolsContext/DevToolsContext';

export type CommandWithoutId = Omit<Command, 'id'>;

const NAVIGATION_COMMANDS = [
    { route: 'sessions', name: 'Go to sessions' },
    { route: 'errors', name: 'Go to errors' },
] as const;

export const getNavigationCommands = (
    organization_id: string,
    history: History
): CommandWithoutId[] => {
    return NAVIGATION_COMMANDS.map(({ name, route }) => ({
        category: 'Navigation',
        command() {
            history.push(`/${organization_id}/${route}`);
        },
        name,
    }));
};

export const usePlayerCommands = (
    isHighlightUser: boolean
): CommandWithoutId[] => {
    const [
        showRightPanelPreference,
        setShowRightPanelPreference,
    ] = useLocalStorage('highlightMenuShowRightPanel', true);
    const [openDevTools, setOpenDevTools] = useLocalStorage(
        'highlightMenuOpenDevTools',
        false
    );
    const [autoPlayVideo, setAutoPlayVideo] = useLocalStorage(
        'highlightMenuAutoPlayVideo',
        false
    );
    const [, setSelectedDevToolsTab] = useLocalStorage(
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

    const PLAYER_COMMANDS = [
        // { command: 'sessions', name: 'Toggle comments' },
        {
            command: () => {
                if (selectedTimelineAnnotationTypes.length === 0) {
                    setSelectedTimelineAnnotationTypes([
                        ...selectedTimelineAnnotationTypesUserPersisted,
                    ]);
                } else {
                    setSelectedTimelineAnnotationTypesUserPersisted([
                        ...selectedTimelineAnnotationTypes,
                    ]);
                    setSelectedTimelineAnnotationTypes([]);
                }
            },
            name: 'Toggle timeline annotations',
        },
        {
            command: () => {
                setOpenDevTools(!openDevTools);
            },
            name: 'Toggle DevTools',
        },
        {
            command: () => {
                setShowRightPanelPreference(!showRightPanelPreference);
            },
            name: 'Toggle right panel',
        },
        {
            command: () => {
                setOpenDevTools(true);
                setSelectedDevToolsTab(DevToolTabs.Errors);
            },
            name: 'Toggle errors list',
        },
        {
            command: () => {
                setOpenDevTools(true);
                setSelectedDevToolsTab(DevToolTabs.Network);
            },
            name: 'Toggle network requests',
        },
        {
            command: () => {
                setOpenDevTools(true);
                setSelectedDevToolsTab(DevToolTabs.Console);
            },
            name: 'Toggle console log',
        },
        {
            command: () => {
                setAutoPlayVideo(!autoPlayVideo);
            },
            name: `${autoPlayVideo ? 'Disable' : 'Enable'} auto playing videos`,
        },
        // { command: 'errors4', name: 'Copy URL' },
        // { command: 'errors5', name: 'Copy URL at current timestamp' },
    ] as const;

    /** These commands should only be exposed for Highlight engineering. */
    const HIGHLIGHT_COMMANDS = [
        {
            command: () => {
                setShowRightPanelPreference(true);
                document.location.search = 'debug=1';
            },
            name: `Enable events debugging`,
        },
        {
            command: () => {
                document.location.search = 'download=1';
            },
            name: `Download events`,
        },
    ] as const;

    const pathNameTokens = location.pathname.split('/');
    // We don't have access to the session_id URL parameter on all routes so we manually parse/check for the session_id.
    const isOnPlayerPage =
        pathNameTokens[pathNameTokens.length - 2] === 'sessions' &&
        !Number.isNaN(parseInt(pathNameTokens[pathNameTokens.length - 1]));

    // Don't show Player-specific commands when not on the player page.
    if (!isOnPlayerPage) {
        return [];
    }

    let commands;

    if (isHighlightUser) {
        commands = [...PLAYER_COMMANDS, ...HIGHLIGHT_COMMANDS];
    } else {
        commands = [...PLAYER_COMMANDS];
    }

    return commands.map(({ name, command }) => ({
        category: 'Player',
        name,
        command,
    }));
};

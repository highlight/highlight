import useLocalStorage from '@rehooks/local-storage';
import { message } from 'antd';
import { History } from 'history';
import { Command } from 'react-command-palette';
import { EventsForTimeline } from '../../../pages/Player/PlayerHook/utils';
import { onGetLinkWithTimestamp } from '../../../pages/Player/ShareButton/utils/utils';
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
    const [time] = useLocalStorage('playerTime', 0);

    const PLAYER_COMMANDS = [
        {
            command: () => {
                if (selectedTimelineAnnotationTypes.includes('Comments')) {
                    setSelectedTimelineAnnotationTypes(
                        [...selectedTimelineAnnotationTypes].filter(
                            (type) => type !== 'Comments'
                        )
                    );
                } else {
                    setSelectedTimelineAnnotationTypes([
                        ...selectedTimelineAnnotationTypes,
                        'Comments',
                    ]);
                }
            },
            name: `${
                selectedTimelineAnnotationTypes.includes('Comments')
                    ? 'Hide'
                    : 'Show'
            } comments`,
        },
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
            name: `${openDevTools ? 'Hide' : 'Show'} DevTools`,
        },
        {
            command: () => {
                setShowRightPanelPreference(!showRightPanelPreference);
            },
            name: `${showRightPanelPreference ? 'Hide' : 'Show'} right panel`,
        },
        {
            command: () => {
                if (selectedDevToolsTab === DevToolTabs.Errors) {
                    setOpenDevTools(false);
                } else {
                    setOpenDevTools(true);
                    setSelectedDevToolsTab(DevToolTabs.Errors);
                }
            },
            name: 'Toggle errors list',
        },
        {
            command: () => {
                if (selectedDevToolsTab === DevToolTabs.Network) {
                    setOpenDevTools(false);
                } else {
                    setOpenDevTools(true);
                    setSelectedDevToolsTab(DevToolTabs.Network);
                }
            },
            name: 'Toggle network requests',
        },
        {
            command: () => {
                if (selectedDevToolsTab === DevToolTabs.Console) {
                    setOpenDevTools(false);
                } else {
                    setOpenDevTools(true);
                    setSelectedDevToolsTab(DevToolTabs.Console);
                }
            },
            name: 'Toggle console log',
        },
        {
            command: () => {
                setAutoPlayVideo(!autoPlayVideo);
            },
            name: `${autoPlayVideo ? 'Disable' : 'Enable'} auto playing videos`,
        },
        {
            command: () => {
                const url = window.location.href;
                message.success('Copied link!');
                navigator.clipboard.writeText(url);
            },
            name: 'Copy URL',
        },
        {
            command: () => {
                const url = onGetLinkWithTimestamp(time);
                message.success('Copied link!');
                navigator.clipboard.writeText(url.href);
            },
            name: 'Copy URL at current timestamp',
        },
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

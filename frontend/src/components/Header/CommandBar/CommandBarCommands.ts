import { History } from 'history';
import { Command } from 'react-command-palette';

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

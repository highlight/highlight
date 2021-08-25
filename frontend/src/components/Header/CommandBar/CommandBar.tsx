import React, { useEffect } from 'react';
import CommandPalette, { Command } from 'react-command-palette';
import { RouteComponentProps } from 'react-router';
import { useParams, withRouter } from 'react-router-dom';

import { useAuthContext } from '../../../authentication/AuthContext';
import { useGetOrganizationSuggestionLazyQuery } from '../../../graph/generated/hooks';
import styles from './CommandBar.module.scss';
import {
    CommandWithoutId,
    getNavigationCommands,
    usePlayerCommands,
} from './CommandBarCommands';
import CommandBarCommand from './components/CommandBarCommand';

const THEME = {
    container: styles.container,
    modal: styles.modal,
    overlay: 'atom-overlay',
    content: 'atom-content',
    containerOpen: 'atom-containerOpen',
    input: styles.input,
    inputOpen: 'atom-inputOpen',
    inputFocused: styles.inputFocused,
    spinner: 'atom-spinner',
    suggestionsContainer: 'atom-suggestionsContainer',
    suggestionsContainerOpen: styles.suggestionsContainerOpen,
    suggestionsList: 'atom-suggestionsList',
    suggestion: styles.suggestion,
    suggestionFirst: 'atom-suggestionFirst',
    suggestionHighlighted: styles.suggestionHighlighted,
    trigger: 'atom-trigger',
};

const CommandPaletteComponent: React.FC<RouteComponentProps> = ({
    history,
}) => {
    const [
        getOrganizations,
        { data },
    ] = useGetOrganizationSuggestionLazyQuery();
    const { isHighlightAdmin } = useAuthContext();
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const playerCommands = usePlayerCommands(isHighlightAdmin);

    useEffect(() => {
        if (isHighlightAdmin) {
            getOrganizations({
                variables: { query: '' },
            });
        }
    }, [getOrganizations, isHighlightAdmin]);

    const organizationCommands: CommandWithoutId[] =
        data?.organizationSuggestion?.map((o, index) => {
            return {
                category: 'Organizations',
                id: o?.id ?? index,
                name: `${o?.name ?? index.toString()}`,
                command() {
                    history.push(`/${o?.id}/sessions`);
                },
            };
        }) ?? [];

    const navigationCommands: CommandWithoutId[] = getNavigationCommands(
        organization_id,
        history
    );

    const commands: Command[] = [
        ...playerCommands,
        ...navigationCommands,
        ...organizationCommands,
    ].map((command, index) => ({ ...command, id: index }));

    return (
        <CommandPalette
            trigger={<></>}
            hotKeys={['command+k', 'ctrl+k']}
            highlightFirstSuggestion={false}
            closeOnSelect
            commands={commands}
            renderCommand={CommandBarCommand}
            options={{ keys: ['name', 'category'] }}
            theme={THEME}
            resetInputOnOpen
            maxDisplayed={25}
        />
    );
};

export const CommandBar = withRouter(CommandPaletteComponent);

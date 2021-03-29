import React, { useEffect } from 'react';

// @ts-ignore
import CommandPalette from 'react-command-palette';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';
import { useGetOrganizationSuggestionLazyQuery } from '../../../graph/generated/hooks';

const Bar: React.FC<RouteComponentProps> = ({ history }) => {
    const [
        getOrganizations,
        { data },
    ] = useGetOrganizationSuggestionLazyQuery();

    useEffect(() => {
        getOrganizations({
            variables: { query: '' },
        });
    }, [getOrganizations]);

    return (
        <CommandPalette
            trigger={<></>}
            hotKeys={['command+k', 'ctrl+k']}
            onChange={(inputValue: string) => {
                getOrganizations({
                    variables: { query: inputValue },
                });
            }}
            highlightFirstSuggestion={false}
            closeOnSelect
            commands={
                data?.organizationSuggestion?.map((o) => {
                    return {
                        id: o?.id ?? '',
                        name: o?.name ?? '',
                        command() {
                            history.push(`/${o?.id}/setup`);
                        },
                    };
                }) ?? []
            }
        />
    );
};

export const CommandBar = withRouter(Bar);

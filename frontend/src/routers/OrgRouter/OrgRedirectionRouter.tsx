import { useGetProjectsAndWorkspacesQuery } from '@graph/hooks';
import React from 'react';
import { Redirect, useHistory } from 'react-router-dom';

import { LoadingPage } from '../../components/Loading/Loading';

export const ProjectRedirectionRouter = () => {
    const { loading, error, data } = useGetProjectsAndWorkspacesQuery();
    const history = useHistory();

    if (error) {
        return <p>{'App error: ' + JSON.stringify(error)}</p>;
    }

    if (loading) {
        return <LoadingPage />;
    }

    let redirectTo;
    if (data?.projects?.length) {
        redirectTo = `/${data!.projects[0]!.id}${history.location.pathname}`;
    } else if (data?.workspaces?.length) {
        redirectTo = `/w/${data!.workspaces[0]!.id}/new`;
    } else {
        redirectTo = '/new';
    }

    // Redirects the user to their default project when the URL does not have an project ID.
    // For example, this allows linking to https://app.highlight.run/sessions for https://app.highlight.run/1/sessions
    return <Redirect to={redirectTo} />;
};

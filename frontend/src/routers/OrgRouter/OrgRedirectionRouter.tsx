import { useAppLoadingContext } from '@context/AppLoadingContext';
import { useGetProjectsAndWorkspacesQuery } from '@graph/hooks';
import React, { useEffect } from 'react';
import { Redirect, useHistory } from 'react-router-dom';

export const ProjectRedirectionRouter = () => {
    const { loading, error, data } = useGetProjectsAndWorkspacesQuery();
    const { setIsLoading } = useAppLoadingContext();
    const history = useHistory();

    useEffect(() => {
        if (loading) {
            setIsLoading(true);
        }
        if (error) {
            setIsLoading(false);
        }
    }, [loading, setIsLoading, error]);

    if (error) {
        return <p>{'App error: ' + JSON.stringify(error)}</p>;
    }

    if (loading) {
        return null;
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

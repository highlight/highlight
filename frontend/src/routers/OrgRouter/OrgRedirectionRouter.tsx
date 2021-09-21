import { useGetProjectsQuery } from '@graph/hooks';
import React from 'react';
import { Redirect, useHistory } from 'react-router-dom';

import { LoadingPage } from '../../components/Loading/Loading';

export const ProjectRedirectionRouter = () => {
    const {
        loading: o_loading,
        error: o_error,
        data: o_data,
    } = useGetProjectsQuery();
    const history = useHistory();

    if (o_error) {
        return <p>{'App error: ' + JSON.stringify(o_error)}</p>;
    }

    if (o_loading) {
        return <LoadingPage />;
    }

    // Redirects the user to their default project when the URL does not have an project ID.
    // For example, this allows linking to https://app.highlight.run/sessions for https://app.highlight.run/1/sessions
    return (
        <Redirect
            to={
                o_data?.projects?.length
                    ? `/${o_data!.projects[0]!.id}${history.location.pathname}`
                    : `/new`
            }
        />
    );
};

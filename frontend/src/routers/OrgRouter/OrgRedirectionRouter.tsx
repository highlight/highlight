import React from 'react';
import { Redirect, useHistory } from 'react-router-dom';

import { LoadingPage } from '../../components/Loading/Loading';
import { useGetOrganizationsQuery } from '../../graph/generated/hooks';

export const OrgRedirectionRouter = () => {
    const {
        loading: o_loading,
        error: o_error,
        data: o_data,
    } = useGetOrganizationsQuery();
    const history = useHistory();

    if (o_error) {
        return <p>{'App error: ' + JSON.stringify(o_error)}</p>;
    }

    if (o_loading) {
        return <LoadingPage />;
    }

    // Redirects the user to their default organization when the URL does not have an organization ID.
    // For example, this allows linking to https://app.highlight.run/sessions for https://app.highlight.run/1/sessions
    return (
        <Redirect
            to={
                o_data?.organizations?.length
                    ? `/${o_data!.organizations[0]!.id}${
                          history.location.pathname
                      }`
                    : `/new`
            }
        />
    );
};

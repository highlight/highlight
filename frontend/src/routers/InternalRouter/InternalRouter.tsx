import { useAppLoadingContext } from '@context/AppLoadingContext';
import React, { lazy, Suspense, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';

const InternalRouter = () => {
    const { setIsLoading } = useAppLoadingContext();

    useEffect(() => {
        setIsLoading(false);
    }, [setIsLoading]);

    return (
        <Switch>
            <Suspense fallback={<></>}>
                <Route
                    path="/_internal/query-builder"
                    component={lazy(
                        () => import('../../pages/Internal/QueryBuilderPage')
                    )}
                />
                <Route
                    exact
                    path="/_internal"
                    component={lazy(
                        () => import('../../pages/Internal/InternalPage')
                    )}
                />
            </Suspense>
        </Switch>
    );
};

export default InternalRouter;

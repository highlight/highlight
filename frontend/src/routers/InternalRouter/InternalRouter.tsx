import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';

const InternalRouter = () => {
    return (
        <Switch>
            <Suspense fallback={<></>}>
                <Route
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

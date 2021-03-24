import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router';
import { Switch } from 'react-router-dom';

export const About = () => {
    return (
        <Switch>
            <Suspense fallback={<></>}>
                <Route
                    path="/about/privacy"
                    component={lazy(() => import('./Privacy'))}
                />
                <Route
                    path="/about/terms"
                    component={lazy(() => import('./TermsOfService'))}
                />
                <Route
                    path={['/about/careers', '/']}
                    exact
                    component={lazy(() => import('./Careers'))}
                />
            </Suspense>
        </Switch>
    );
};

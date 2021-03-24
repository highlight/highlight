import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router';
import { Switch } from 'react-router-dom';

export const About = () => {
    return (
        <Switch>
            <Suspense fallback={<div>loading...</div>}>
                <Route
                    path="/privacy"
                    component={lazy(() => import('./Careers'))}
                />
                <Route
                    path="/terms-of-service"
                    component={lazy(() => import('./TermsOfService'))}
                />
                <Route path="/" component={lazy(() => import('./Privacy'))} />
            </Suspense>
        </Switch>
    );
};

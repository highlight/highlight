import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.scss';
import '@highlight-run/rrweb/dist/index.css';
import * as serviceWorker from './serviceWorker';

import { ApolloProvider } from '@apollo/client';
import { client } from './util/graph';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import { DemoContext } from './DemoContext';
import { H, HighlightOptions } from 'highlight.run';
import { SkeletonTheme } from 'react-loading-skeleton';
import { QueryParamProvider } from 'use-query-params';
import loadable from '@loadable/component';

const dev = process.env.NODE_ENV === 'development' ? true : false;
const options: HighlightOptions = {
    debug: { clientInteractions: true, domRecording: true },
    manualStart: true,
    enableStrictPrivacy: Math.floor(Math.random() * 2) === 0,
};
if (dev) {
    options.scriptUrl = 'http://localhost:8080/dist/index.js';
    window.document.title = `⚙️ DEV ${window.document.title}`;
} else if (window.location.href.includes('onrender')) {
    window.document.title = `📸 PR ${window.document.title}`;
}
H.init(process.env.REACT_APP_FRONTEND_ORG ?? 1, options);
H.start();

window.Intercom('boot', {
    app_id: 'gm6369ty',
    alignment: 'left',
});

const About = loadable(() => import('./pages/About/About'));
const DemoRouter = loadable(() => import('./DemoRouter'));
const LoginForm = loadable(() => import('./pages/Login/Login'));

const App = () => {
    return (
        <ApolloProvider client={client}>
            <QueryParamProvider>
                <SkeletonTheme color={'#F5F5F5'} highlightColor={'#FCFCFC'}>
                    <Router>
                        <Switch>
                            <Route path="/about">
                                <About />
                            </Route>
                            <Route path="/demo" exact>
                                <DemoContext.Provider value={{ demo: true }}>
                                    <DemoRouter />
                                </DemoContext.Provider>
                            </Route>
                            <Route path="/">
                                <DemoContext.Provider value={{ demo: false }}>
                                    <LoginForm />
                                </DemoContext.Provider>
                            </Route>
                        </Switch>
                    </Router>
                </SkeletonTheme>
            </QueryParamProvider>
        </ApolloProvider>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

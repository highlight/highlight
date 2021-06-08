import 'antd/dist/antd.css';
import './index.scss';
import '@highlight-run/rrweb/dist/index.css';

import { ApolloProvider } from '@apollo/client';
import { H, HighlightOptions } from 'highlight.run';
import React from 'react';
import ReactDOM from 'react-dom';
import { SkeletonTheme } from 'react-loading-skeleton';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';

import packageJson from '../package.json';
import { DemoContext } from './DemoContext';
import DemoRouter from './DemoRouter';
import About from './pages/About/About';
import LoginForm from './pages/Login/Login';
import * as serviceWorker from './serviceWorker';
import { client } from './util/graph';

const dev = process.env.NODE_ENV === 'development' ? true : false;
const options: HighlightOptions = {
    debug: { clientInteractions: true, domRecording: true },
    manualStart: true,
    enableStrictPrivacy: Math.floor(Math.random() * 2) === 0,
    version: packageJson['version'],
};
const favicon = document.querySelector("link[rel~='icon']") as any;
if (dev) {
    options.scriptUrl = 'http://localhost:8080/dist/index.js';
    options.backendUrl = 'http://localhost:8082/public';

    const sampleEnvironmentNames = [
        'john',
        'jay',
        'anthony',
        'cameron',
        'boba',
    ];
    options.environment = `${
        sampleEnvironmentNames[
            Math.floor(Math.random() * sampleEnvironmentNames.length)
        ]
    }-localhost`;
    window.document.title = `⚙️ ${window.document.title}`;
    if (favicon) {
        favicon.href = `${process.env.PUBLIC_URL}/favicon-localhost.ico`;
    }
} else if (window.location.href.includes('onrender')) {
    if (favicon) {
        favicon.href = `${process.env.PUBLIC_URL}/favicon-pr.ico`;
    }
    window.document.title = `📸 ${window.document.title}`;
    options.environment = 'Pull Request Preview';
}
H.init(process.env.REACT_APP_FRONTEND_ORG ?? 1, options);
H.start();

window.Intercom('boot', {
    app_id: 'gm6369ty',
    alignment: 'right',
    hide_default_launcher: true,
});

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

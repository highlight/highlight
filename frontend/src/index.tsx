import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.scss';
import '@highlight-run/rrweb/dist/index.css';
import * as serviceWorker from './serviceWorker';

import { ApolloProvider } from '@apollo/client';
import { client } from './util/graph';
import { LoginForm } from './pages/Login/Login';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import { DemoContext } from './DemoContext';
import { H, HighlightOptions } from 'highlight.run';
import { DemoRouter } from './DemoRouter';
import { SkeletonTheme } from 'react-loading-skeleton';

const dev = process.env.NODE_ENV === 'development' ? true : false;
const options: HighlightOptions = {
    debug: { clientInteractions: true, domRecording: true },
    manualStart: true,
};
if (dev) {
    options.scriptUrl = 'http://localhost:8080/dist/index.js';
    options.backendUrl = 'http://localhost:8082';
}
H.init(process.env.REACT_APP_FRONTEND_ORG ?? 1, options);
H.start();

const App = () => {
    return (
        <ApolloProvider client={client}>
            <SkeletonTheme color={'#F5F5F5'} highlightColor={'#FCFCFC'}>
                <Router>
                    <Switch>
                        <Route path="/demo" exact>
                            <DemoContext.Provider value={{ demo: true }}>
                                <DemoRouter />
                            </DemoContext.Provider>
                        </Route>
                        <Route path="/">
                            <LoginForm />
                        </Route>
                    </Switch>
                </Router>
            </SkeletonTheme>
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

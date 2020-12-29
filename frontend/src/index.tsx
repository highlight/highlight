import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.scss';
import * as serviceWorker from './serviceWorker';

import { ApolloProvider } from '@apollo/client';
import { client } from './util/graph';
import { AuthAppRouter } from './App';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import { DemoContext } from './DemoContext';
import { H, HighlightOptions } from 'highlight.run';
import { DemoRouter } from './DemoRouter';
import LogRocket from 'logrocket';

const dev = process.env.NODE_ENV === 'development' ? true : false;
const options: HighlightOptions = { debug: true, manualStart: true };
if (dev) {
    options.scriptUrl = 'http://localhost:8080/dist/index.js';
    options.backendUrl = 'http://localhost:8082';
}
H.init("1jdkoe52", options);
H.start();
LogRocket.init('vcbmdo/highlight');


ReactDOM.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <Router>
                <Switch>
                    <Route path="/demo" exact>
                        <DemoContext.Provider value={{ demo: true }}>
                            <DemoRouter />
                        </DemoContext.Provider>
                    </Route>
                    <Route path="/">
                        <DemoContext.Provider value={{ demo: false }}>
                            <AuthAppRouter />
                        </DemoContext.Provider>
                    </Route>
                </Switch>
            </Router>
        </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

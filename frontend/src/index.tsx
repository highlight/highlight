import React from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.css';
import * as serviceWorker from './serviceWorker';

import { ApolloProvider } from '@apollo/client';
import { client } from './util/graph';
import { AuthAppRouter } from './App';
// @ts-ignore
import CanvasDraw from 'react-canvas-draw';

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <Switch>
                <Route path="/canvas-yo">
                    <CanvasDraw />
                </Route>
                <Route>
                    <ApolloProvider client={client}>
                        <AuthAppRouter />
                    </ApolloProvider>
                </Route>
            </Switch>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

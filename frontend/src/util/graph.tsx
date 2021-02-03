import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
    split,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { setContext } from '@apollo/client/link/context';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import { getMainDefinition } from '@apollo/client/utilities';

// Create a WebSocket link:
const wsLink = new WebSocketLink({
    uri: 'ws://localhost:8082/main',
    options: {
        reconnect: true,
    },
});

const httpLink = createHttpLink({
    uri: process.env.REACT_APP_BACKEND_URI + '/main',
    credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    var user = firebase.auth().currentUser;
    // return the headers to the context so httpLink can read them
    return user?.getIdToken().then((t) => {
        return { headers: { ...headers, token: t } };
    });
});

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    authLink.concat(httpLink)
);

export const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    connectToDevTools:
        process.env.REACT_APP_ENVIRONMENT === 'dev' ? true : false,
});

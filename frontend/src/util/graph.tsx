import 'firebase/auth';

import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
    split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import * as firebase from 'firebase/app';

const uri =
    process.env.REACT_APP_PRIVATE_GRAPH_URI ??
    window.location.origin + '/private';
const highlightGraph = createHttpLink({
    uri,
    credentials: 'include',
});
const socketUri = uri.replace(/(http|https):\/\//, 'ws://');
const highlightSocket = new WebSocketLink({
    uri: socketUri,
    options: {
        lazy: true,
        reconnect: true,
        connectionParams: async () => {
            const token = await firebase.auth().currentUser?.getIdToken();
            return {
                token,
            };
        },
    },
});
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    highlightSocket,
    highlightGraph
);

if (isOnPrem) {
    console.log('Private Graph URI: ', uri);
}

const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const user = firebase.auth().currentUser;
    // return the headers to the context so httpLink can read them
    return user?.getIdToken().then((t) => {
        return { headers: { ...headers, token: t } };
    });
});

export const client = new ApolloClient({
    link: authLink.concat(splitLink),
    cache: new InMemoryCache({
        typePolicies: {
            Session: {
                keyFields: ['secure_id'],
            },
            ErrorGroup: {
                keyFields: ['secure_id'],
            },
        },
    }),
    assumeImmutableResults: true,
    connectToDevTools:
        process.env.REACT_APP_ENVIRONMENT === 'dev' ? true : false,
});

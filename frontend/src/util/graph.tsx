import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';

import * as firebase from 'firebase/app';
import 'firebase/auth';

const httpLink = createHttpLink({
    uri: process.env.REACT_APP_BACKEND_URI + '/main',
    credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const user = firebase.auth().currentUser;
    // return the headers to the context so httpLink can read them
    return user?.getIdToken().then((t) => {
        return { headers: { ...headers, token: t } };
    });
});

const cache = new InMemoryCache();

// await before instantiating ApolloClient, else queries might run before the cache is persisted
persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache,
    assumeImmutableResults: true,
    connectToDevTools:
        process.env.REACT_APP_ENVIRONMENT === 'dev' ? true : false,
});

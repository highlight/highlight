import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import * as firebase from 'firebase/app';
import 'firebase/auth';

const httpLink = createHttpLink({
    uri: "https://backend-2.onrender.com" + '/main',
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

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

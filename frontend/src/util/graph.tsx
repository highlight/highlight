import 'firebase/auth';

import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import * as firebase from 'firebase/app';

const uri =
    process.env.REACT_APP_PRIVATE_GRAPH_URI ??
    window.location.origin + '/private';
const highlightGraph = createHttpLink({
    uri,
    credentials: 'include',
});

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
    link: authLink.concat(highlightGraph),
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

import 'firebase/auth';

import {
    ApolloClient,
    ApolloLink,
    HttpLink,
    InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import * as firebase from 'firebase/app';

const uri =
    process.env.REACT_APP_PRIVATE_GRAPH_URI ??
    window.location.origin + '/private';
const highlightGraph = new HttpLink({
    uri,
    credentials: 'include',
});

const launchNotesGraph = new HttpLink({
    uri: 'https://app.launchnotes.io/graphql',
    headers: {
        Authorization: 'Bearer public_WjznlihAyRRTZD7gjc42TaP4',
    },
});

if (process.env.REACT_APP_ONPREM === 'true') {
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
    link: ApolloLink.split(
        (operation) => operation.getContext().clientName === 'launchNotes',
        launchNotesGraph,
        authLink.concat(highlightGraph)
    ),
    cache: new InMemoryCache(),
    assumeImmutableResults: true,
    connectToDevTools:
        process.env.REACT_APP_ENVIRONMENT === 'dev' ? true : false,
});

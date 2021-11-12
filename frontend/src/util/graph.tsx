import 'firebase/auth';

import {
    ApolloClient,
    ApolloLink,
    createHttpLink,
    HttpLink,
    InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { namedOperations } from '@graph/operations';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import * as firebase from 'firebase/app';

const uri =
    process.env.REACT_APP_PRIVATE_GRAPH_URI ??
    window.location.origin + '/private';
const highlightGraph = createHttpLink({
    uri,
    credentials: 'include',
});

const graphCdnGraph = new HttpLink({
    uri: 'https://graphcdn.highlight.run',
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

const { Query } = namedOperations;
/**
 * These are the queries that should be routed to GraphCDN instead of private graph.
 * We use GraphCDN for expensive queries.
 * */
const GraphCDNOperations = [
    Query.GetKeyPerformanceIndicators,
    Query.GetDailyErrorFrequency,
    Query.GetDailySessionsCount,
    Query.GetReferrersCount,
    Query.GetTopUsers,
    Query.GetRageClicksForProject,
] as const;

export const client = new ApolloClient({
    link: ApolloLink.split(
        (operation) => {
            // Don't query GraphCDN for localhost.
            // GraphCDN only caches production data.
            if (process.env.NODE_ENV === 'development') {
                return false;
            }

            // Check to see if the operation is one that we should send to GraphCDN instead of private graph.
            // @ts-expect-error
            if (GraphCDNOperations.includes(operation.operationName)) {
                return true;
            }
            return false;
        },
        graphCdnGraph,
        authLink.concat(highlightGraph)
    ),
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

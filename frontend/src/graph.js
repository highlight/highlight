import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
	uri: process.env.REACT_APP_BACKEND_URI + "/main",
	cache: new InMemoryCache()
});

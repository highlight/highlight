import * as Types from './operations'

import { gql } from '@apollo/client'
import * as Apollo from '@apollo/client'
const defaultOptions = {} as const

export const GetAdminDocument = gql`
	query GetAdmin($year: Int!) {
		admin {
			id
			name
			email
		}
	}
`

/**
 * __useGetAdminQuery__
 *
 * To run a query within a React component, call `useGetAdminQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAdminQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAdminQuery({
 *   variables: {
 *      year: // value for 'year'
 *   },
 * });
 */
export function useGetAdminQuery(
	baseOptions: Apollo.QueryHookOptions<
		Types.GetAdminQuery,
		Types.GetAdminQueryVariables
	>,
) {
	const options = { ...defaultOptions, ...baseOptions }
	return Apollo.useQuery<Types.GetAdminQuery, Types.GetAdminQueryVariables>(
		GetAdminDocument,
		options,
	)
}
export function useGetAdminLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		Types.GetAdminQuery,
		Types.GetAdminQueryVariables
	>,
) {
	const options = { ...defaultOptions, ...baseOptions }
	return Apollo.useLazyQuery<
		Types.GetAdminQuery,
		Types.GetAdminQueryVariables
	>(GetAdminDocument, options)
}
export type GetAdminQueryHookResult = ReturnType<typeof useGetAdminQuery>
export type GetAdminLazyQueryHookResult = ReturnType<
	typeof useGetAdminLazyQuery
>
export type GetAdminQueryResult = Apollo.QueryResult<
	Types.GetAdminQuery,
	Types.GetAdminQueryVariables
>

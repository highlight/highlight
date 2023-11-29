# TODO(vkorolik) parse queries from `query.gql`
GET_SESSIONS_CLICKHOUSE = """
query GetSessionsClickhouse($project_id: ID!, $count: Int!, $query: ClickhouseQuery!, $sort_desc: Boolean!, $sort_field: String, $page: Int) {
  sessions_clickhouse(
    project_id: $project_id
    count: $count
    query: $query
    sort_field: $sort_field
    sort_desc: $sort_desc
    page: $page
  ) {
    sessions {
      id
    }
    totalCount
    __typename
  }
}
"""

GET_ERROR_GROUPS_CLICKHOUSE = """
query GetErrorGroupsClickhouse(
	$project_id: ID!
	$count: Int!
	$query: ClickhouseQuery!
	$page: Int
) {
	error_groups_clickhouse(
		project_id: $project_id
		count: $count
		query: $query
		page: $page
	) {
		error_groups {
			created_at
			updated_at
			id
			secure_id
			type
			event
			state
			state
			snoozed_until
			environments
			stack_trace
			structured_stack_trace {
				fileName
				lineNumber
				functionName
				columnNumber
			}
			error_frequency
			error_metrics {
				error_group_id
				date
				name
				value
			}
			is_public
			project_id
			error_tag {
				id
				created_at
				title
				description
			}
		}
		totalCount
	}
}
"""

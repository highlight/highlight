# TODO(vkorolik) parse queries from `query.gql`
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

GET_LOGS = """
query GetLogs($project_id: ID!, $params: QueryInput!, $after: String, $before: String, $at: String, $direction: SortDirection!) {
  logs(
    project_id: $project_id
    params: $params
    after: $after
    before: $before
    at: $at
    direction: $direction
  ) {
    edges {
      cursor
      node {
        timestamp
        level
        message
        logAttributes
        traceID
        spanID
        secureSessionID
        source
        serviceName
        serviceVersion
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}"""

GET_TRACES = """
query GetTraces($project_id: ID!, $params: QueryInput!, $after: String, $before: String, $at: String, $direction: SortDirection!) {
  traces(
    project_id: $project_id
    params: $params
    after: $after
    before: $before
    at: $at
    direction: $direction
  ) {
    edges {
      cursor
      node {
        timestamp
        traceID
        spanID
        parentSpanID
        projectID
        secureSessionID
        traceState
        spanName
        spanKind
        duration
        serviceName
        serviceVersion
        environment
        hasErrors
        traceAttributes
        statusCode
        statusMessage
        __typename
      }
      __typename
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
      __typename
    }
    __typename
  }
}
"""

GET_ADMIN = """
query GetAdmin {
  admin {
    id
    uid
    name
    email
    phone
    photo_url
    slack_im_channel_id
    email_verified
    user_defined_role
    about_you_details_filled
    __typename
  }
}
"""

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
      secure_id
      client_id
      fingerprint
      identifier
      identified
      os_name
      os_version
      browser_name
      browser_version
      ip
      city
      state
      country
      postal
      created_at
      language
      length
      active_length
      enable_recording_network_contents
      viewed
      starred
      processed
      has_rage_clicks
      has_errors
      fields {
        name
        value
        type
        id
        __typename
      }
      first_time
      user_properties
      event_counts
      last_user_interaction_time
      is_public
      excluded
      __typename
    }
    totalCount
    __typename
  }
}
"""

GET_SESSION = """
query GetSession($secure_id: String!) {
  session(secure_id: $secure_id) {
    secure_id
    os_name
    os_version
    browser_name
    browser_version
    environment
    app_version
    ip
    city
    state
    country
    postal
    fingerprint
    created_at
    payload_updated_at
    language
    user_object
    user_properties
    identifier
    identified
    client_id
    starred
    enable_strict_privacy
    enable_recording_network_contents
    field_group
    fields {
      name
      value
      type
      __typename
    }
    object_storage_enabled
    payload_size
    processed
    excluded
    excluded_reason
    has_rage_clicks
    has_errors
    within_billing_quota
    client_version
    firstload_version
    client_config
    is_public
    event_counts
    direct_download_url
    resources_url
    web_socket_events_url
    timeline_indicators_url
    deviceMemory
    last_user_interaction_time
    length
    active_length
    chunked
    __typename
  }
}
"""

GET_SESSION_INTERVALS = """
query GetSessionIntervals($session_secure_id: String!) {
  session_intervals(session_secure_id: $session_secure_id) {
    start_time
    end_time
    active
    duration
    __typename
  }
}
"""

GET_EVENT_CHUNKS = """
query GetEventChunks($secure_id: String!) {
  event_chunks(secure_id: $secure_id) {
    session_id
    chunk_index
    timestamp
    __typename
  }
}
"""

GET_EVENT_CHUNK_URL = """
query GetEventChunkURL($secure_id: String!, $index: Int!) {
  event_chunk_url(secure_id: $secure_id, index: $index)
}
"""

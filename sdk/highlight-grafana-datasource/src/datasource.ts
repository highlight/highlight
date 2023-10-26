import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  MutableDataFrame,
} from '@grafana/data';

import { HighlightDataSourceOptions, HighlightQuery } from './types';
import { getBackendSrv } from '@grafana/runtime';

const GET_SESSIONS_CLICKHOUSE = `
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
`;

interface Session {
  created_at: string;
  secure_id: string;
  active_length: number;
}
interface Error {
  message: string;
  path: string[];
}

export class DataSource extends DataSourceApi<HighlightQuery, HighlightDataSourceOptions> {
  url?: string;
  projectID?: number;

  constructor(instanceSettings: DataSourceInstanceSettings<HighlightDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url;
    this.projectID = instanceSettings.jsonData.projectID;
  }

  async query(options: DataQueryRequest<HighlightQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from;
    const to = range!.to;

    const response = await getBackendSrv().post<{
      data: {
        sessions_clickhouse: { sessions: Session[] };
      };
      errors?: Error[];
    }>(
      `${this.url}/highlight/`,
      JSON.stringify({
        operationName: 'GetSessionsClickhouse',
        variables: {
          query: {
            isAnd: true,
            rules: [['custom_created_at', 'between_date', `${from.toISOString()}_${to.toISOString()}`]],
          },
          count: 10,
          page: 1,
          project_id: this.projectID,
          sort_desc: true,
        },
        query: GET_SESSIONS_CLICKHOUSE,
      }),
      {
        credentials: 'include',
      }
    );
    if (response.errors?.length) {
      throw response.errors.map((e) => JSON.stringify(e)).join(', ');
    }

    // Return a constant for each query.
    const data = options.targets.map((target) => {
      return new MutableDataFrame({
        refId: target.refId,
        fields: [
          {
            name: 'Time',
            values: response.data.sessions_clickhouse.sessions.map((s) => Date.parse(s.created_at)),
            type: FieldType.time,
          },
          {
            name: 'Value',
            values: response.data.sessions_clickhouse.sessions.map((s) => s.active_length),
            type: FieldType.number,
          },
        ],
      });
    });

    return { data };
  }

  async testDatasource() {
    // TODO(vkorolik) Implement a health check for your data source.
    try {
      await getBackendSrv().post<{}>(
        `${this.url}/highlight/`,
        JSON.stringify({
          operationName: 'GetSessionsClickhouse',
          variables: {
            query: {
              isAnd: true,
              rules: [],
            },
            count: 10,
            page: 1,
            project_id: this.projectID,
            sort_desc: true,
          },
          query: GET_SESSIONS_CLICKHOUSE,
        }),
        {
          credentials: 'include',
        }
      );
    } catch (e: unknown) {
      return {
        status: 'error',
        message: (e as { data: { message: string } }).data.message,
      };
    }

    return {
      status: 'success',
      message: 'Success',
    };
  }
}

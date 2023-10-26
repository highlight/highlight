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
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    // TODO(vkorolik) respect range
    const response = await getBackendSrv().post<{}>(
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
      {}
    );
    // TODO(vkorolik) use response
    console.log('vadim', { response, url: this.url });

    // Return a constant for each query.
    const data = options.targets.map((target) => {
      return new MutableDataFrame({
        refId: target.refId,
        fields: [
          { name: 'Time', values: [from, to], type: FieldType.time },
          { name: 'Value', values: [target.constant, target.constant], type: FieldType.number },
        ],
      });
    });

    return { data };
  }

  async testDatasource() {
    // TODO(vkorolik)
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}

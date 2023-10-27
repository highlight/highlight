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

const GET_ADMIN = `
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
  }
}
`;

const GET_TRACES_METRICS = `
query GetTracesMetrics($project_id: ID!, $params: QueryInput!, $metric_types: [TracesMetricType!]!, $group_by: [String!]!) {
  traces_metrics(
    project_id: $project_id
    params: $params
    metric_types: $metric_types
    group_by: $group_by
  ) {
    buckets {
      bucket_id
      group
      metric_type
      metric_value
      __typename
    }
    bucket_count
    sample_factor
    __typename
  }
}
`;

interface Bucket {
  bucket_id: number;
  metric_type: string;
  metric_value: number;
  group: string[];
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

    // Return a constant for each query.
    const data = await Promise.all(
      options.targets.map(async (target) => {
        const response = await getBackendSrv().post<{
          data: {
            traces_metrics: { buckets: Bucket[] };
          };
          errors?: Error[];
        }>(
          `${this.url}/highlight/`,
          JSON.stringify({
            operationName: 'GetTracesMetrics',
            variables: {
              project_id: '1',
              metric_types: ['count', 'p90'],
              group_by: [],
              params: {
                query: target.queryText,
                date_range: {
                  start_date: from.toISOString(),
                  end_date: to.toISOString(),
                },
              },
            },
            query: GET_TRACES_METRICS,
          }),
          {}
        );
        if (response.errors?.length) {
          throw response.errors.map((e) => JSON.stringify(e)).join(', ');
        }

        const fields: any = [
          {
            name: 'Time',
            values: response.data.traces_metrics.buckets.map(
              (b) =>
                new Date(
                  from.valueOf() +
                    (b.bucket_id / response.data.traces_metrics.buckets.length) * (to.valueOf() - from.valueOf())
                )
            ),
            type: FieldType.time,
          },
        ];
        for (const metricType of new Set(response.data.traces_metrics.buckets.map((b) => b.metric_type))) {
          for (const metricGroup of new Set(response.data.traces_metrics.buckets.map((b) => b.group.join('-')))) {
            fields.push({
              name: [metricType, metricGroup].filter((s) => s).join('.'),
              values: response.data.traces_metrics.buckets
                .filter((b) => b.metric_type === metricType && b.group.join('-') === metricGroup)
                .map((b) => b.metric_value),
              type: FieldType.number,
            });
          }
        }
        return new MutableDataFrame({
          refId: target.refId,
          fields,
        });
      })
    );

    return { data };
  }

  async testDatasource() {
    try {
      const response = await getBackendSrv().post<{
        admin: { email: string };
        errors?: Error[];
      }>(
        `${this.url}/highlight/`,
        JSON.stringify({
          operationName: 'GetAdmin',
          query: GET_ADMIN,
        }),
        {}
      );
      if (response.errors?.length) {
        return {
          status: 'error',
          message: response.errors.map((e) => JSON.stringify(e)).join(', '),
        };
      }
      if (!response.admin.email) {
        return {
          status: 'error',
          message: 'invalid login returned',
        };
      }
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

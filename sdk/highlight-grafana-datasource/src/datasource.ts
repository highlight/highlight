import { CoreApp, DataSourceInstanceSettings } from '@grafana/data';

import { HighlightDataSourceOptions, HighlightQuery } from './types';
import { DataSourceWithBackend } from '@grafana/runtime';

export const tableOptions = [{ value: 'traces', label: 'traces' }];

export const columnOptions = [{ value: 'duration', label: 'duration' }];

export const bucketByOptions = [
  { value: 'Timestamp', label: 'Timestamp' },
  { value: 'None', label: 'None' },
];

export const metricOptions = [
  { value: 'Count', label: 'Count' },
  { value: 'Min', label: 'Min' },
  { value: 'Avg', label: 'Avg' },
  { value: 'P50', label: 'P50' },
  { value: 'P90', label: 'P90' },
  { value: 'P95', label: 'P95' },
  { value: 'P99', label: 'P99' },
  { value: 'Max', label: 'Max' },
  { value: 'Sum', label: 'Sum' },
];

export class DataSource extends DataSourceWithBackend<HighlightQuery, HighlightDataSourceOptions> {
  url?: string;
  projectID?: number;

  constructor(instanceSettings: DataSourceInstanceSettings<HighlightDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url;
    this.projectID = instanceSettings.jsonData.projectID;
  }

  getDefaultQuery(app: CoreApp): Partial<HighlightQuery> {
    return {
      table: tableOptions[0].value,
      column: columnOptions[0].value,
      bucketBy: bucketByOptions[0].value,
      metric: metricOptions[0].value,
      groupBy: [],
      limit: 10,
      limitAggregator: metricOptions[0].value,
      limitColumn: columnOptions[0].value,
    };
  }
}

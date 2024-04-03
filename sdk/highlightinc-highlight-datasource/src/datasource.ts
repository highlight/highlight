import { CoreApp, DataSourceInstanceSettings, ScopedVars } from '@grafana/data';

import { HighlightDataSourceOptions, HighlightQuery, Table } from './types';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';

export const tableOptions: { value: Table; label: string }[] = [
  { value: 'traces', label: 'traces' },
  { value: 'logs', label: 'logs' },
  { value: 'errors', label: 'errors' },
  { value: 'sessions', label: 'sessions' },
];

export const columnOptions: { value: string; label: string }[] = [{ value: 'duration', label: 'duration' }];

export const bucketByOptions: { value: string; label: string }[] = [
  { value: 'Timestamp', label: 'Timestamp' },
  { value: 'None', label: 'None' },
];

export const metricOptions: { value: string; label: string; tables: Table[] }[] = [
  { value: 'Count', label: 'Count', tables: ['traces', 'logs', 'errors', 'sessions'] },
  { value: 'Min', label: 'Min', tables: ['traces', 'logs', 'sessions'] },
  { value: 'Avg', label: 'Avg', tables: ['traces', 'logs', 'sessions'] },
  { value: 'P50', label: 'P50', tables: ['traces', 'logs', 'sessions'] },
  { value: 'P90', label: 'P90', tables: ['traces', 'logs', 'sessions'] },
  { value: 'P95', label: 'P95', tables: ['traces', 'logs', 'sessions'] },
  { value: 'P99', label: 'P99', tables: ['traces', 'logs', 'sessions'] },
  { value: 'Max', label: 'Max', tables: ['traces', 'logs', 'sessions'] },
  { value: 'Sum', label: 'Sum', tables: ['traces', 'logs', 'sessions'] },
];

export class DataSource extends DataSourceWithBackend<HighlightQuery, HighlightDataSourceOptions> {
  url?: string;
  projectID?: number;

  constructor(instanceSettings: DataSourceInstanceSettings<HighlightDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url;
    this.projectID = instanceSettings.jsonData.projectID;
  }

  applyTemplateVariables(query: HighlightQuery, scopedVars: ScopedVars): Record<string, any> {
    const interpolatedQuery: HighlightQuery = {
      ...query,
      queryText: getTemplateSrv().replace(query.queryText, scopedVars),
    };

    return interpolatedQuery;
  }

  getDefaultQuery(app: CoreApp): Partial<HighlightQuery> {
    return {
      table: tableOptions[0].value,
      column: columnOptions[0].value,
      bucketBy: bucketByOptions[0].value,
      bucketCount: 50,
      metric: metricOptions[0].value,
      groupBy: [],
      limit: 10,
      limitAggregator: metricOptions[0].value,
      limitColumn: columnOptions[0].value,
    };
  }
}

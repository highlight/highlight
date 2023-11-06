import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface HighlightQuery extends DataQuery {
  table?: string;
  metrics?: string[];
  groupBy?: string[];
  queryText?: string;
}

/**
 * These are options configured for each DataSource instance
 */
export interface HighlightDataSourceOptions extends DataSourceJsonData {
  projectID?: number;
  clientID?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface HighlightSecureJsonData {
  clientSecret?: string;
}

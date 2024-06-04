import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export type Table = 'traces' | 'logs' | 'errors' | 'sessions';

export interface HighlightQuery extends DataQuery {
  table?: Table;
  metric?: string;
  column?: string;
  groupBy?: string[];
  queryText?: string;
  bucketBy?: string;
  bucketCount?: number;
  limitAggregator?: string;
  limitColumn?: string;
  limit?: number;
}

/**
 * These are options configured for each DataSource instance
 */
export interface HighlightDataSourceOptions extends DataSourceJsonData {
  projectID?: number;
  clientID?: string;
  backendURL?: string;
  tokenURL?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface HighlightSecureJsonData {
  clientSecret?: string;
}

export interface HighlightVariableQuery {
  table?: Table;
  key?: string;
}

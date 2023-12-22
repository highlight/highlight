import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { HighlightQuery, HighlightDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, HighlightQuery, HighlightDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);

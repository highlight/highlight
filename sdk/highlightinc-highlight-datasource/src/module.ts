import { DataSourcePlugin } from '@grafana/data';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { VariableQueryEditor } from './components/VariableQueryEditor';
import { DataSource } from './datasource';
import { HighlightDataSourceOptions, HighlightQuery } from './types';

export const plugin = new DataSourcePlugin<DataSource, HighlightQuery, HighlightDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor)
  .setVariableQueryEditor(VariableQueryEditor);

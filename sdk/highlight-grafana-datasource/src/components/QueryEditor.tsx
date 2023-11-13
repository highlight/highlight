import React, { ChangeEvent, useEffect } from 'react';
import { Field, Input, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import { HighlightDataSourceOptions, HighlightQuery } from '../types';

type Props = QueryEditorProps<DataSource, HighlightQuery, HighlightDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const { queryText, table, groupBy, metric, column } = query;

  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, queryText: event.target.value });
  };

  const onTableChange = (option: SelectableValue<string>) => {
    onChange({ ...query, table: option.value });
  };

  const onGroupByChange = (option: SelectableValue) => {
    onChange({ ...query, groupBy: option.map((o: any) => o.value) });
  };

  const onMetricChange = (option: SelectableValue<string>) => {
    onChange({ ...query, metric: option.value });
  };

  const onColumnChange = (option: SelectableValue<string>) => {
    onChange({ ...query, column: option.value });
  };

  const tableOptions = [{ value: 'traces', label: 'traces' }];

  const selectOptions = [{ value: 'Duration', label: 'Duration' }];

  useEffect(() => {
    onChange({ ...query, table: table ?? tableOptions[0].value, column: column ?? selectOptions[0].value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metricOptions = [
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

  const groupByOptions = [
    { value: 'SpanName', label: 'span_name' },
    { value: 'ServiceName', label: 'service_name' },
    { value: 'ServiceVersion', label: 'service_version' },
    { value: 'http.status_code', label: 'http.status_code' },
  ];

  return (
    <div className="gf-form">
      <Field label="Table">
        <Select value={table} onChange={onTableChange} options={tableOptions} />
      </Field>
      <Field label="Metric">
        <Select value={metric} onChange={onMetricChange} options={metricOptions} />
      </Field>
      {metric !== undefined && metric !== 'Count' && (
        <Field label="Column">
          <Select value={column} onChange={onColumnChange} options={selectOptions} />
        </Field>
      )}
      <Field label="Group By">
        <Select value={groupBy} onChange={onGroupByChange} options={groupByOptions} isMulti />
      </Field>
      <Field label="Query">
        <Input value={queryText} onChange={onQueryTextChange} />
      </Field>
    </div>
  );
}

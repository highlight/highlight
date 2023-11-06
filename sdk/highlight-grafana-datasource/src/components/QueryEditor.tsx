import React, { ChangeEvent, useState } from 'react';
import { InlineField, Input, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import { HighlightDataSourceOptions, HighlightQuery } from '../types';

type Props = QueryEditorProps<DataSource, HighlightQuery, HighlightDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, queryText: event.target.value });
  };

  const onTableChange = (option: SelectableValue<string>) => {
    onChange({ ...query, table: option.value });
  };

  const onGroupByChange = (option: SelectableValue) => {
    onChange({ ...query, groupBy: option.map((o: any) => o.value) });
  };

  const onMetricsChange = (option: SelectableValue) => {
    onChange({ ...query, metrics: option.map((o: any) => o.value) });
  };

  const { queryText, table, groupBy, metrics } = query;

  const tableOptions = [{ value: 'traces', label: 'traces' }];

  const metricOptions = [
    { value: 'p90', label: 'p90' },
    { value: 'count', label: 'count' },
  ];

  const columnOptions = [
    { value: 'Timestamp', label: 'Timestamp' },
    { value: 'UUID', label: 'UUID' },
    { value: 'TraceId', label: 'TraceId' },
    { value: 'SpanId', label: 'SpanId' },
    { value: 'ParentSpanId', label: 'ParentSpanId' },
    { value: 'ProjectId', label: 'ProjectId' },
    { value: 'SecureSessionId', label: 'SecureSessionId' },
    { value: 'TraceState', label: 'TraceState' },
    { value: 'SpanName', label: 'SpanName' },
    { value: 'SpanKind', label: 'SpanKind' },
    { value: 'Duration', label: 'Duration' },
    { value: 'ServiceName', label: 'ServiceName' },
    { value: 'ServiceVersion', label: 'ServiceVersion' },
    { value: 'TraceAttributes', label: 'TraceAttributes' },
    { value: 'StatusCode', label: 'StatusCode' },
    { value: 'StatusMessage', label: 'StatusMessage' },
  ];

  return (
    <div className="gf-form">
      <InlineField label="Table">
        <Select value={table} onChange={onTableChange} options={tableOptions} />
      </InlineField>
      <InlineField label="Metrics">
        <Select value={metrics} onChange={onMetricsChange} options={metricOptions} isMulti />
      </InlineField>
      <InlineField label="Group By">
        <Select value={groupBy} onChange={onGroupByChange} options={columnOptions} isMulti />
      </InlineField>
      <InlineField label="Query">
        <Input value={queryText} onChange={onQueryTextChange} />
      </InlineField>
    </div>
  );
}

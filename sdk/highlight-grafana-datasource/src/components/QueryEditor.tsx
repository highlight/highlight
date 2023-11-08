import React, { ChangeEvent, useEffect, useState } from 'react';
import { InlineField, Input, Select, Tag, TagsInput } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import { HighlightDataSourceOptions, HighlightQuery } from '../types';

type Props = QueryEditorProps<DataSource, HighlightQuery, HighlightDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const { queryText, table, groupBy, metrics, column } = query;

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
    { value: 'p90', label: 'p90' },
    { value: 'count', label: 'count' },
  ];

  const groupByOptions = [
    { value: 'TraceState', label: 'TraceState' },
    { value: 'SpanName', label: 'SpanName' },
    { value: 'SpanKind', label: 'SpanKind' },
    { value: 'ServiceName', label: 'ServiceName' },
    { value: 'ServiceVersion', label: 'ServiceVersion' },
    { value: 'http.status_code', label: 'http.status_code' },
  ];

  return (
    <div className="gf-form">
      <InlineField label="Table">
        <Select value={table} onChange={onTableChange} options={tableOptions} />
      </InlineField>
      <InlineField label="Metrics">
        <Select value={metrics} onChange={onMetricsChange} options={metricOptions} isMulti />
      </InlineField>
      <InlineField label="Column">
        <Select value={column} onChange={onColumnChange} options={selectOptions} />
      </InlineField>
      <InlineField label="Group By">
        <Select value={groupBy} onChange={onGroupByChange} options={groupByOptions} isMulti />
      </InlineField>
      <InlineField label="Query">
        <Input value={queryText} onChange={onQueryTextChange} />
      </InlineField>
    </div>
  );
}

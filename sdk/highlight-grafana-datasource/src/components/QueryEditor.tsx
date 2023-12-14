import React, { ChangeEvent } from 'react';
import { AsyncMultiSelect, AsyncSelect, InlineField, InlineFieldRow, Input, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource, bucketByOptions, columnOptions, metricOptions, tableOptions } from '../datasource';
import { HighlightDataSourceOptions, HighlightQuery } from '../types';

type Props = QueryEditorProps<DataSource, HighlightQuery, HighlightDataSourceOptions>;

interface TraceKey {
  Name: string;
  Type: 'String' | 'Numeric';
}

export function QueryEditor({ query, onChange, datasource }: Props) {
  const { queryText, table, groupBy, metric, column, bucketBy, limitAggregator, limitColumn, limit } = query;

  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, queryText: event.target.value });
  };

  const onTableChange = (option: SelectableValue<string>) => {
    onChange({ ...query, table: option.value });
  };

  const onGroupByChange = (option: SelectableValue) => {
    onChange({ ...query, groupBy: option.map((o: any) => o.label) });
  };

  const onMetricChange = (option: SelectableValue<string>) => {
    onChange({ ...query, metric: option.value });
  };

  const onColumnChange = (option: SelectableValue<string>) => {
    onChange({ ...query, column: option.value });
  };

  const onBucketByChange = (option: SelectableValue<string>) => {
    onChange({ ...query, bucketBy: option.value });
  };

  const onLimitAggregatorChange = (option: SelectableValue<string>) => {
    onChange({ ...query, limitAggregator: option.value });
  };

  const onLimitColumnChange = (option: SelectableValue<string>) => {
    onChange({ ...query, limitColumn: option.value });
  };

  const onLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, limit: Number(event.target.value) });
  };

  const loadColumnOptions = async (table: string | undefined, query: string) => {
    let keys: TraceKey[] = await datasource.getResource(`${table}-keys`, { query, type: 'Numeric' });
    return (table === 'traces' ? columnOptions : []).concat(keys.map((k) => ({ value: k.Name, label: k.Name })));
  };

  const loadGroupByOptions = async (table: string | undefined, query: string) => {
    let keys: TraceKey[] = await datasource.getResource(`${table}-keys`, { query, type: 'String' });
    return keys.map((k) => ({ value: k.Name, label: k.Name }));
  };

  return (
    <div>
      <InlineFieldRow>
        <InlineField label="Resource" labelWidth={10}>
          <Select value={table} onChange={onTableChange} options={tableOptions} />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label="Function" labelWidth={10}>
          <Select value={metric} onChange={onMetricChange} options={metricOptions} />
        </InlineField>
        {metric !== undefined && metric !== 'Count' && (
          <InlineField>
            <AsyncSelect
              key={table}
              defaultOptions
              value={{ name: column, label: column }}
              onChange={onColumnChange}
              loadOptions={(q) => loadColumnOptions(table, q)}
            />
          </InlineField>
        )}
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label="Filter" labelWidth={10}>
          <Input value={queryText} onChange={onQueryTextChange} placeholder="Enter a Highlight query..." width={60} />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label="Group by" labelWidth={10}>
          <AsyncMultiSelect
            key={table}
            defaultOptions
            value={groupBy?.map((g) => ({ name: g, label: g }))}
            onChange={onGroupByChange}
            loadOptions={(q) => loadGroupByOptions(table, q)}
          />
        </InlineField>
        {groupBy !== undefined && groupBy.length > 0 && (
          <>
            <InlineField label="Limit">
              <Input type="number" value={limit} onChange={onLimitChange} width={8} />
            </InlineField>
            <InlineField label="By">
              <Select value={limitAggregator} onChange={onLimitAggregatorChange} options={metricOptions} />
            </InlineField>
            {limitAggregator !== undefined && limitAggregator !== 'Count' && (
              <InlineField>
                <AsyncSelect
                  key={table}
                  defaultOptions
                  value={{ name: limitColumn, label: limitColumn }}
                  onChange={onLimitColumnChange}
                  loadOptions={(q) => loadGroupByOptions(table, q)}
                />
              </InlineField>
            )}
          </>
        )}
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label="Bucket by" labelWidth={10}>
          <Select value={bucketBy} onChange={onBucketByChange} options={bucketByOptions} />
        </InlineField>
      </InlineFieldRow>
    </div>
  );
}

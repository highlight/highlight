import React, { ChangeEvent, useEffect } from 'react';
import { AsyncMultiSelect, AsyncSelect, Field, Input, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import { HighlightDataSourceOptions, HighlightQuery } from '../types';

type Props = QueryEditorProps<DataSource, HighlightQuery, HighlightDataSourceOptions>;

interface TraceKey {
  Name: string;
  Type: 'String' | 'Numeric';
}

export function QueryEditor({ query, onChange, onRunQuery, datasource }: Props) {
  const { queryText, table, groupBy, metric, column, bucketBy, limitAggregator, limitColumn, limit } = query;

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

  const tableOptions = [{ value: 'traces', label: 'traces' }];

  const columnOptions = [{ value: 'duration', label: 'duration' }];

  const bucketByOptions = [
    { value: 'Timestamp', label: 'Timestamp' },
    { value: 'None', label: 'None' },
  ];

  useEffect(() => {
    onChange({
      ...query,
      table: table ?? tableOptions[0].value,
      column: column ?? columnOptions[0].value,
      bucketBy: bucketBy ?? bucketByOptions[0].value,
      groupBy: groupBy ?? [],
    });
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

  const loadColumnOptions = async (query: string) => {
    let keys: TraceKey[] = await datasource.getResource('traces-keys');
    return columnOptions
      .concat(keys.filter((k) => k.Type === 'Numeric').map((k) => ({ value: k.Name, label: k.Name })))
      .filter((k) => k.label.toLowerCase().includes(query.toLowerCase()));
  };

  const loadGroupByOptions = async (query: string) => {
    let keys: TraceKey[] = await datasource.getResource('traces-keys');
    return keys
      .map((k) => ({ value: k.Name, label: k.Name }))
      .filter((k) => k.label.toLowerCase().includes(query.toLowerCase()));
  };

  return (
    <div className="gf-form">
      <Field label="Resource">
        <Select value={table} onChange={onTableChange} options={tableOptions} />
      </Field>
      <Field label="Query">
        <Input value={queryText} onChange={onQueryTextChange} />
      </Field>
      <Field label="Aggregator">
        <Select value={metric} onChange={onMetricChange} options={metricOptions} />
      </Field>
      {metric !== undefined && metric !== 'Count' && (
        <Field label="Column">
          <AsyncSelect
            defaultOptions
            value={{ name: column, label: column }}
            onChange={onColumnChange}
            loadOptions={loadColumnOptions}
          />
        </Field>
      )}
      <Field label="Group By">
        <AsyncMultiSelect
          defaultOptions
          value={groupBy?.map((g) => ({ name: g, label: g }))}
          onChange={onGroupByChange}
          loadOptions={loadGroupByOptions}
          isMulti
        />
      </Field>
      {groupBy !== undefined && groupBy.length > 0 && (
        <>
          <Field label="Top">
            <Input type="number" value={limit} onChange={onLimitChange} />
          </Field>
          <Field label="Aggregator">
            <Select value={limitAggregator} onChange={onLimitAggregatorChange} options={metricOptions} />
          </Field>
          {limitAggregator !== undefined && limitAggregator !== 'Count' && (
            <Field label="Column">
              <AsyncSelect
                defaultOptions
                value={{ name: limitColumn, label: limitColumn }}
                onChange={onLimitColumnChange}
                loadOptions={loadColumnOptions}
              />
            </Field>
          )}
        </>
      )}
      <Field label="Bucket By">
        <Select value={bucketBy} onChange={onBucketByChange} options={bucketByOptions} />
      </Field>
    </div>
  );
}

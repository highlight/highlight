import React, { useState } from 'react';
import { SelectableValue } from '@grafana/data';
import { InlineField, InlineFieldRow, Input, Select } from '@grafana/ui';

import { tableOptions } from '../datasource';
import { HighlightVariableQuery, Table } from '../types';

interface VariableQueryProps {
  query: HighlightVariableQuery;
  onChange: (query: HighlightVariableQuery) => void;
}

export const VariableQueryEditor = ({ onChange, query }: VariableQueryProps) => {
  const { key, resource } = query;
  const [keyText, setKeytext] = useState<string | undefined>(key);

  const handleResourceChange = (option: SelectableValue<Table>) => {
    const newResource = option.value;
    onChange({ ...query, resource: newResource });
  };

  const handleKeyChange = (option: SelectableValue<string>) => {
    setKeytext(option.target.value);
  };

  const handleKeyBlur = () => {
    onChange({ ...query, key: keyText });
  };

  return (
    <>
      <InlineFieldRow>
        <InlineField label="Resource" labelWidth={10}>
          <Select
            value={resource}
            onChange={handleResourceChange}
            options={tableOptions}
            placeholder="Select resource"
            width={40}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label="Key" labelWidth={10}>
          <Input
            value={keyText}
            onChange={handleKeyChange}
            onBlur={handleKeyBlur}
            placeholder="Enter key from table"
            width={40}
          />
        </InlineField>
      </InlineFieldRow>
    </>
  );
};

import React, { useState } from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';

import { tableOptions } from '../datasource';
import { HighlightVariableQuery, Table } from '../types';

interface VariableQueryProps {
  query: HighlightVariableQuery;
  onChange: (query: HighlightVariableQuery) => void;
}

export const VariableQueryEditor = ({ onChange, query }: VariableQueryProps) => {
  const { key, table } = query;
  const [keyText, setKeytext] = useState<string | undefined>(key);

  const handleTableChange = (option: SelectableValue<Table>) => {
    const newTable = option.value;
    onChange({ ...query, table: newTable });
  };

  const handleKeyChange = (option: SelectableValue<string>) => {
    setKeytext(option.target.value);
  };

  const handleKeyBlur = () => {
    onChange({ ...query, key: keyText });
  };

  return (
    <>
      <div className="gf-form">
        <span className="gf-form-label width-10">Table</span>
        <Select value={table} onChange={handleTableChange} options={tableOptions} />
      </div>
      <div className="gf-form">
        <span className="gf-form-label width-10">Key</span>
        <input name="key" className="gf-form-input" onChange={handleKeyChange} onBlur={handleKeyBlur} value={keyText} />
      </div>
    </>
  );
};

import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { InlineField, Input, SecretInput } from '@grafana/ui';
import React, { ChangeEvent } from 'react';
import { HighlightDataSourceOptions, HighlightSecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<HighlightDataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const onProjectIDChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      projectID: Number(event.target.value),
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onClientIDChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      clientID: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onBackendURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      backendURL: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onTokenURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      tokenURL: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  const onClientSecretChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        clientSecret: event.target.value,
      },
    });
  };

  const onClientSecretReset = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        clientSecret: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        clientSecret: '',
      },
    });
  };

  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as HighlightSecureJsonData;

  return (
    <div className="gf-form-group">
      <InlineField label="Highlight Backend URL" labelWidth={20}>
        <Input
          onChange={onBackendURLChange}
          value={jsonData.backendURL || ''}
          placeholder="Highlight Backend URL"
          width={40}
        />
      </InlineField>
      <InlineField label="OAuth Token URL" labelWidth={20}>
        <Input onChange={onTokenURLChange} value={jsonData.tokenURL || ''} placeholder="OAuth Token URL" width={40} />
      </InlineField>
      <InlineField label="Project ID" labelWidth={20}>
        <Input
          onChange={onProjectIDChange}
          value={jsonData.projectID || ''}
          placeholder="Highlight Project ID"
          width={40}
        />
      </InlineField>
      <InlineField label="Client ID" labelWidth={20}>
        <Input
          onChange={onClientIDChange}
          value={jsonData.clientID || ''}
          placeholder="Highlight OAuth Client ID"
          width={40}
        />
      </InlineField>
      <InlineField label="Client Secret" labelWidth={20}>
        <SecretInput
          isConfigured={(secureJsonFields && secureJsonFields.clientSecret) as boolean}
          value={secureJsonData.clientSecret || ''}
          placeholder="Highlight OAuth Client Secret"
          width={40}
          onReset={onClientSecretReset}
          onChange={onClientSecretChange}
        />
      </InlineField>
    </div>
  );
}

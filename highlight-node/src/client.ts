import {
    getSdk,
    Sdk,
    PushBackendPayloadMutationVariables,
} from './graph/generated/operations';
import ErrorStackParser from 'error-stack-parser';
import { GraphQLClient } from 'graphql-request';
import { NodeOptions } from './types';

export class Highlight {
    _graphqlSdk: Sdk;
    _backendUrl: string;

    constructor(options: NodeOptions) {
        this._backendUrl = options.backendUrl || 'https://pub.highlight.run';
        const client = new GraphQLClient(this._backendUrl, {
            headers: {},
        });
        this._graphqlSdk = getSdk(client);
    }

    consumeCustomError(
        error: Error,
        secureSessionId: string,
        requestId: string
    ) {
        let res: ErrorStackParser.StackFrame[] = [];
        try {
            res = ErrorStackParser.parse(error);
        } catch {}
        const variables: PushBackendPayloadMutationVariables = {
            errors: [
                {
                    event: error.message
                        ? `${error.name}: ${error.message}`
                        : `${error.name}`,
                    request_id: requestId,
                    session_secure_id: secureSessionId,
                    source: '',
                    stackTrace: JSON.stringify(res),
                    timestamp: new Date().toISOString(),
                    type: 'BACKEND',
                    url: '',
                },
            ],
        };
        this._graphqlSdk.PushBackendPayload(variables);
    }
}
